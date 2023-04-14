Rails.application.routes.draw do
  resources :tasks do
    member do
      patch "update_task_state"
      delete :delete_attachment
    end
  end

  devise_for :users
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html
  match "/404", to: "errors#not_found", via: :all
  match "/500", to: "errors#internal_server_error", via: :all

  # Defines the root path route ("/")
  # root "articles#index"
  root to: "home#index"
end
