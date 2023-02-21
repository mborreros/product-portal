class ProductsShelvesController < ApplicationController

  def index
    render json: ProductsShelf.all, status: :ok
  end

  def show
    join_record = ProductsShelf.find_by(id: params[:id])
    if join_record
      render json: join_record, status: :ok
    else 
      render json: {error: "product/shelf join record not found"}, status: :not_found
    end
  end

end
