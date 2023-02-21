class Product < ApplicationRecord

  has_many :products_shelves
  has_many :shelves, through: :products_shelves

  validates :name, presence: true
  validates :lot_number, presence: true
  validates :weight, presence: true
  validates :complete, presence: true

end
