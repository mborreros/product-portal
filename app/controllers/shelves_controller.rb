class ShelvesController < ApplicationController

  def index
    render json: Shelf.all, status: :ok
  end

  def show
    shelf = Shelf.find_by(id: params[:id])
    if shelf
      render json: shelf, status: :ok
    else 
      render json: {error: "shelf not found"}, status: :not_found
    end
  end

end
