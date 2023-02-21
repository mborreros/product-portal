class ProductSerializer < ActiveModel::Serializer
  attributes :id, :name, :lot_number, :weight, :complete

  belongs_to :shelf
end
