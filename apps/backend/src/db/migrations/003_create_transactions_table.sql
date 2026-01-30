-- Create transactions table for payment records
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  moyasar_payment_id VARCHAR(100) UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'SAR',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  payment_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_moyasar_payment_id ON transactions(moyasar_payment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add check constraint for valid transaction statuses
ALTER TABLE transactions ADD CONSTRAINT valid_transaction_status 
  CHECK (status IN ('pending', 'completed', 'failed', 'refunded'));

-- Add check constraint for positive amounts
ALTER TABLE transactions ADD CONSTRAINT positive_amount CHECK (amount >= 0);
