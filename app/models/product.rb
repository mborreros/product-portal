class Product < ApplicationRecord

  belongs_to :shelf

  validates :name, presence: true
  validates :lot_number, presence: true
  validates :weight, presence: true
  validates :shelf_id, presence: true

end
