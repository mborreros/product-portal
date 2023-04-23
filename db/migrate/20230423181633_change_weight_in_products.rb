class ChangeWeightInProducts < ActiveRecord::Migration[7.0]

  def up
    change_column :products, :weight, :float
  end

  def down
    change_column :products, :weight, :integer
  end

end
