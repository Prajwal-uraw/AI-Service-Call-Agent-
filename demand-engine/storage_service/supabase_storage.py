"""
Supabase Storage service for PDF reports
Uploads and manages PDF files in Supabase Storage
"""

import os
import logging
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from supabase import create_client, Client

logger = logging.getLogger(__name__)


class SupabaseStorageClient:
    """Client for managing PDF storage in Supabase"""
    
    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
        
        self.client: Client = create_client(supabase_url, supabase_key)
        self.bucket_name = "roi-reports"
        
        # Ensure bucket exists
        self._ensure_bucket_exists()
    
    def _ensure_bucket_exists(self):
        """Create the storage bucket if it doesn't exist"""
        try:
            # Try to get bucket
            self.client.storage.get_bucket(self.bucket_name)
            logger.info(f"Storage bucket '{self.bucket_name}' exists")
        except Exception:
            # Create bucket if it doesn't exist
            try:
                self.client.storage.create_bucket(
                    self.bucket_name,
                    options={"public": False}  # Private bucket
                )
                logger.info(f"Created storage bucket '{self.bucket_name}'")
            except Exception as e:
                logger.error(f"Failed to create bucket: {str(e)}")
    
    def upload_pdf(
        self,
        pdf_bytes: bytes,
        filename: str,
        lead_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Upload PDF to Supabase Storage
        
        Args:
            pdf_bytes: PDF file content as bytes
            filename: Name of the file
            lead_id: Optional lead ID for organization
            
        Returns:
            Dict with file path and public URL
        """
        try:
            # Generate storage path
            timestamp = datetime.now().strftime("%Y/%m/%d")
            if lead_id:
                file_path = f"{timestamp}/{lead_id}/{filename}"
            else:
                file_path = f"{timestamp}/{filename}"
            
            # Upload file
            response = self.client.storage.from_(self.bucket_name).upload(
                path=file_path,
                file=pdf_bytes,
                file_options={
                    "content-type": "application/pdf",
                    "upsert": "true"  # Overwrite if exists
                }
            )
            
            logger.info(f"Uploaded PDF to: {file_path}")
            
            # Generate signed URL (valid for 7 days)
            signed_url = self.get_signed_url(file_path, expires_in=604800)
            
            return {
                "success": True,
                "file_path": file_path,
                "signed_url": signed_url,
                "bucket": self.bucket_name
            }
            
        except Exception as e:
            logger.error(f"Failed to upload PDF: {str(e)}")
            raise
    
    def get_signed_url(self, file_path: str, expires_in: int = 3600) -> str:
        """
        Generate a signed URL for private file access
        
        Args:
            file_path: Path to file in storage
            expires_in: URL expiration time in seconds (default 1 hour)
            
        Returns:
            Signed URL string
        """
        try:
            response = self.client.storage.from_(self.bucket_name).create_signed_url(
                path=file_path,
                expires_in=expires_in
            )
            
            if isinstance(response, dict) and 'signedURL' in response:
                return response['signedURL']
            elif isinstance(response, dict) and 'signed_url' in response:
                return response['signed_url']
            else:
                logger.error(f"Unexpected response format: {response}")
                raise ValueError("Failed to generate signed URL")
                
        except Exception as e:
            logger.error(f"Failed to generate signed URL: {str(e)}")
            raise
    
    def delete_pdf(self, file_path: str) -> bool:
        """
        Delete PDF from storage
        
        Args:
            file_path: Path to file in storage
            
        Returns:
            True if successful
        """
        try:
            self.client.storage.from_(self.bucket_name).remove([file_path])
            logger.info(f"Deleted PDF: {file_path}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete PDF: {str(e)}")
            return False
    
    def list_pdfs(self, prefix: Optional[str] = None) -> list:
        """
        List PDFs in storage
        
        Args:
            prefix: Optional path prefix to filter results
            
        Returns:
            List of file objects
        """
        try:
            files = self.client.storage.from_(self.bucket_name).list(
                path=prefix or ""
            )
            return files
        except Exception as e:
            logger.error(f"Failed to list PDFs: {str(e)}")
            return []
