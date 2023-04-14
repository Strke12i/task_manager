// This file is auto-generated by ./bin/rails stimulus:manifest:update
// Run that command whenever you add a new controller or create them with
// ./bin/rails generate stimulus controllerName

import { application } from "./application"

import AttachmentController from "./attachment_controller"
application.register("attachment", AttachmentController)

import HelloController from "./hello_controller"
application.register("hello", HelloController)

import SlimController from "./slim_controller"
application.register("slim", SlimController)

import ToggleController from "./toggle_controller"
application.register("toggle", ToggleController)
