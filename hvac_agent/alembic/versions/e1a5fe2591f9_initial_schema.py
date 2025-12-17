"""Initial schema

Revision ID: e1a5fe2591f9
Revises:
Create Date: 2025-12-14 22:36:06.986266

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e1a5fe2591f9'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # SQLite doesn't support ALTER COLUMN, and TEXT vs VARCHAR(255) is equivalent in SQLite anyway
    # For PostgreSQL, this would change the type, but since we're using SQLite for CI/CD, skip it
    # If you need to run this on PostgreSQL, use batch_alter_table or conditional logic

    # Check if we're using SQLite
    conn = op.get_bind()
    if conn.dialect.name == 'sqlite':
        # SQLite: TEXT and VARCHAR(255) are equivalent, no action needed
        pass
    else:
        # PostgreSQL or other databases: alter the column type
        op.alter_column('appointments', 'customer_email',
                   existing_type=sa.TEXT(),
                   type_=sa.String(length=255),
                   existing_nullable=True)


def downgrade() -> None:
    """Downgrade schema."""
    # Same logic for downgrade
    conn = op.get_bind()
    if conn.dialect.name == 'sqlite':
        # SQLite: no action needed
        pass
    else:
        # PostgreSQL or other databases: revert the column type
        op.alter_column('appointments', 'customer_email',
                   existing_type=sa.String(length=255),
                   type_=sa.TEXT(),
                   existing_nullable=True)

