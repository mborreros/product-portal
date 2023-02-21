class ProductsShelfSerializer < ActiveModel::Serializer
  attributes :id

  belongs_to :shelf
  belongs_to :product

end
