class ProductsController < ApplicationController

  skip_before_action :verify_authenticity_token

  def index
    products = Product.all
    render json: products, status: :ok
  end

  def show
    product = Product.find_by(id: params[:id])
    if product
      render json: product, status: :ok
    else 
      render json: {error: "product not found"}, status: :not_found
    end
  end

  def create
    if params["_json"].kind_of? Array

      new_products_array = Array.new
      params["_json"].each do |product|
        imported_product = Product.create(name: product[:name], lot_number: product[:lot_number], weight: product[:weight], shelf_id: product[:shelf][:id], sap_material_number: product[:sap_material_number], expiration_date: product[:expiration_date], complete: product[:complete])
        new_products_array << imported_product
      end

      render json: new_products_array, status: :created
    else
      new_product = Product.create!(product_params)
      render json: new_product, status: :created
    end
  end

  def update
    if params["_json"].kind_of? Array
      audited_products_array = Array.new
      params["_json"].each do |product|
        this_product = Product.find_by(id: product[:id])
        if this_product
          this_product.update!(shelf_id: product[:shelf_id])
          audited_products_array << this_product
        end 
      end
      render json: audited_products_array, status: :ok
    else
      product = Product.find_by(id: params[:id])
      if product
        product.update!(product_params)
        render json: product, status: :ok
      else
        render json: {error: "product record could not be located, update failed"}
      end
    end
  end

  def destroy
    product = Product.find_by(id: params[:id])
    if product 
      product.destroy
      render json: {message: "this product record was deleted"}, status: :ok
    else
      render json: {error: "product record could not be located, deletion fails"}, status: :not_found
    end
  end

  private 

  def product_params
    params.permit(:name, :lot_number, :weight, :complete, :shelf_id, :sap_material_number, :expiration_date)
  end

end
