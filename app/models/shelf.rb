class Shelf < ApplicationRecord

  has_many :products_shelves
  has_many :products, through: :products_shelves

  validates :name, presence: true

end
