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
    new_product = Product.create!(product_params)
    render json: new_product, status: :created
  end

  def update
    product = Product.find_by(id: params[:id])
    if product
      product.update!(product_params)
      render json: product, status: :ok
    else
      render json: {error: "product record could not be located, update failed"}
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
    params.permit(:name, :lot_number, :weight, :complete)
  end

end
