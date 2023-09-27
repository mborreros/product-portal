class ShelfSerializer < ActiveModel::Serializer
  attributes :id, :name, :total_products

  def total_products
    object.products.count
  end
end
