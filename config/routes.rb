Rails.application.routes.draw do
  scope "/api" do
    resources :shelves, only: [:index, :show, :create]
    resources :products, only: [:index, :show, :create, :update, :destroy]
  end

  get "*path", to: "fallback#index", constraints:->(req) { !req.xhr? && req.format.html? }
  
end
