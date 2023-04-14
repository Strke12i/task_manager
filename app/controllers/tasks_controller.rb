class TasksController < ApplicationController
  before_action :set_task, only: %i[ show edit update destroy ]
  before_action :require_user, except: [:create,:index,:new]

  def update_task_state
    @task = Task.find(params[:id])
    @task.update(finished: !(@task.finished) )
    redirect_to tasks_url
  end

  def delete_attachment
    @task = Task.find(params[:id])
    attached = @task.attachments.find(params[:attach_id])
    attached.purge
    render turbo_stream: turbo_stream.replace("task-attachments",partial: "tasks/attachments",locals:{attachments:@task.attachments})

  end
  # GET /tasks or /tasks.json
  def index
    @tasks = User.find(current_user.id).assigned_tasks.order(finished: :asc, due_date: :asc)
  end

  # GET /tasks/1 or /tasks/1.json
  def show
  end

  # GET /tasks/new
  def new
    @task = Task.new
  end

  # GET /tasks/1/edit
  def edit
  end

  # POST /tasks or /tasks.json
  def create
    @task = Task.new(task_params.except(:users))
    @task.user_id = current_user.id
    @task.assigned_users << User.where(id: [task_params[:users].reject{ |s| s.empty?}][0].append(current_user.id.to_s))


    respond_to do |format|
      if @task.save
        format.html { redirect_to task_url(@task), notice: "Task was successfully created." }
        format.json { render :show, status: :created, location: @task }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @task.errors, status: :unprocessable_entity }

      end
    end
  end

  # PATCH/PUT /tasks/1 or /tasks/1.json
  def update
    respond_to do |format|
      if @task.update(task_params.except(:users,:attachments))
        if task_params[:attachments].present?
          print task_params[:attachments]
          task_params[:attachments].each do |attachment|
            if attachment != ""
              existing_blob = @task.attachments.blobs.find_by(filename:attachment.original_filename)

              if existing_blob.present?
                existing_attachment = @task.attachments.where(blob_id: existing_blob.id)
                existing_attachment.purge if existing_attachment.present?
              end

              @task.attachments.attach(attachment)

            end
          end
        end
        @task.assigned_users.replace(User.where(id: [task_params[:users].reject{ |s| s.empty?}][0].append(current_user.id.to_s)))
        format.html { redirect_to task_url(@task), notice: "Task was successfully updated." }
        format.json { render :show, status: :ok, location: @task }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @task.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /tasks/1 or /tasks/1.json
  def destroy
    redirect_to root_path, alert: 'Você não tem permissão para acessar esta página' unless @task.user_id == current_user.id
    @task.destroy

    respond_to do |format|
      format.html { redirect_to tasks_url, notice: "Task was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_task
      @task = Task.find(params[:id])
    end

    def require_user
      redirect_to root_path, alert: "You don´t have permission to go there" unless @task.assigned_users.include?(current_user)
    end

    # Only allow a list of trusted parameters through.
    def task_params
      params.require(:task).permit(:name, :description, :due_date, :user_id, :finished, attachments:[], users: [])
    end


end
