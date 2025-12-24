/**
 * Export Utilities
 * Functions for exporting data to CSV and PDF
 */

export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) {
    alert("No data to export");
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values that might contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportLeadsToCSV(leads: any[]) {
  const exportData = leads.map(lead => ({
    'Business Name': lead.business_name || '',
    'Contact Name': lead.contact_name || '',
    'Email': lead.email || '',
    'Phone': lead.phone || '',
    'City': lead.city || '',
    'State': lead.state || '',
    'Business Type': lead.business_type || '',
    'Lead Score': lead.lead_score || 0,
    'Tier': lead.tier || '',
    'Status': lead.status || '',
    'Source': lead.source_type || '',
    'Created': lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '',
  }));

  exportToCSV(exportData, 'leads-export');
}

export function exportContactsToCSV(contacts: any[]) {
  const exportData = contacts.map(contact => ({
    'First Name': contact.first_name || '',
    'Last Name': contact.last_name || '',
    'Email': contact.email || '',
    'Phone': contact.phone || '',
    'Mobile': contact.mobile || '',
    'Company': contact.company_name || '',
    'Job Title': contact.job_title || '',
    'City': contact.city || '',
    'State': contact.state || '',
    'Email Subscribed': contact.email_subscribed ? 'Yes' : 'No',
    'SMS Subscribed': contact.sms_subscribed ? 'Yes' : 'No',
    'Created': contact.created_at ? new Date(contact.created_at).toLocaleDateString() : '',
  }));

  exportToCSV(exportData, 'contacts-export');
}

export function exportTasksToCSV(tasks: any[]) {
  const exportData = tasks.map(task => ({
    'Title': task.title || '',
    'Description': task.description || '',
    'Type': task.task_type || '',
    'Status': task.status || '',
    'Priority': task.priority || '',
    'Due Date': task.due_date ? new Date(task.due_date).toLocaleDateString() : '',
    'Assigned To': task.assigned_to || '',
    'Lead': task.leads?.business_name || '',
    'Created': task.created_at ? new Date(task.created_at).toLocaleDateString() : '',
  }));

  exportToCSV(exportData, 'tasks-export');
}

export function exportSignalsToCSV(signals: any[]) {
  const exportData = signals.map(signal => ({
    'Source': signal.source_type || '',
    'Title': signal.title || '',
    'Author': signal.author || '',
    'Urgency Score': signal.urgency_score || 0,
    'Budget Score': signal.budget_score || 0,
    'Authority Score': signal.authority_score || 0,
    'Pain Score': signal.pain_score || 0,
    'Status': signal.status || '',
    'Converted': signal.converted_to_lead ? 'Yes' : 'No',
    'Created': signal.created_at ? new Date(signal.created_at).toLocaleDateString() : '',
  }));

  exportToCSV(exportData, 'signals-export');
}

/**
 * Generate a simple PDF report (text-based)
 * For more advanced PDFs, consider using jsPDF or pdfmake
 */
export function generateSimplePDFReport(title: string, data: any[]) {
  // For now, we'll create a formatted text file
  // In production, integrate jsPDF or similar library
  
  const content = [
    title,
    '='.repeat(title.length),
    '',
    `Generated: ${new Date().toLocaleString()}`,
    `Total Records: ${data.length}`,
    '',
    '---',
    '',
    JSON.stringify(data, null, 2)
  ].join('\n');

  const blob = new Blob([content], { type: 'text/plain' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
