class ProductSerializer < ActiveModel::Serializer
  attributes :id, :lot_number,  :sap_material_number, :name, :weight, :complete, :updated_at

  belongs_to :shelf
end
