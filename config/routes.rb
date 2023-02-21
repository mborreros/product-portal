Rails.application.routes.draw do
  resources :products_shelves, only: [:index, :show, :create, :destroy]
  resources :shelves, only: [:index, :show, :create]
  resources :products, only: [:index, :show, :create, :update, :destroy]
end
