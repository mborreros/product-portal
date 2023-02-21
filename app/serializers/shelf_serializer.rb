class ShelfSerializer < ActiveModel::Serializer
  attributes :id, :name

  has_many :products, through: :products_shelves
end
