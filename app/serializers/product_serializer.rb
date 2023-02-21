class ProductSerializer < ActiveModel::Serializer
  attributes :id, :lot_number, :name, :weight, :complete

  belongs_to :shelf
end
