"""Add location tracking, delivery dates, and order items

Revision ID: abc123order001
Revises: cd511c28d326
Create Date: 2026-04-24 08:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'abc123order001'
down_revision = 'cd511c28d326'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add location to users
    op.add_column('users', sa.Column('location', sa.String(), nullable=True))
    
    # Add columns to orders
    op.add_column('orders', sa.Column('location', sa.String(), nullable=True))
    op.add_column('orders', sa.Column('delivery_date', sa.DateTime(), nullable=True))
    op.add_column('orders', sa.Column('payment_method', sa.String(), nullable=False, server_default='COD'))
    op.add_column('orders', sa.Column('notes', sa.Text(), nullable=True))
    op.add_column('orders', sa.Column('updated_at', sa.DateTime(), nullable=True))
    
    # Update status default
    op.alter_column('orders', 'status', existing_type=sa.String(), nullable=False, server_default='pending')
    
    # Create order_items table
    op.create_table(
        'order_items',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('order_id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('price', sa.Float(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_order_items_order_id'), 'order_items', ['order_id'], unique=False)
    op.create_index(op.f('ix_order_items_product_id'), 'order_items', ['product_id'], unique=False)


def downgrade() -> None:
    # Drop order_items table
    op.drop_index(op.f('ix_order_items_product_id'), table_name='order_items')
    op.drop_index(op.f('ix_order_items_order_id'), table_name='order_items')
    op.drop_table('order_items')
    
    # Remove columns from orders
    op.drop_column('orders', 'updated_at')
    op.drop_column('orders', 'notes')
    op.drop_column('orders', 'payment_method')
    op.drop_column('orders', 'delivery_date')
    op.drop_column('orders', 'location')
    
    # Remove location from users
    op.drop_column('users', 'location')
