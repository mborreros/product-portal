class ProductSerializer < ActiveModel::Serializer
  attributes :id, :name, :lot_number, :weight, :complete

  has_many :shelves, through: :products_shelves
end
