"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectSettings = void 0;
const typeorm_1 = require("typeorm");
let ProjectSettings = class ProjectSettings {
};
exports.ProjectSettings = ProjectSettings;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ProjectSettings.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', unique: true }),
    __metadata("design:type", String)
], ProjectSettings.prototype, "project_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'char', length: 2, nullable: true }),
    __metadata("design:type", String)
], ProjectSettings.prototype, "default_country", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, nullable: true }),
    __metadata("design:type", String)
], ProjectSettings.prototype, "default_language", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ProjectSettings.prototype, "check_cron", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time', nullable: true }),
    __metadata("design:type", String)
], ProjectSettings.prototype, "check_window_start", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time', nullable: true }),
    __metadata("design:type", String)
], ProjectSettings.prototype, "check_window_end", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], ProjectSettings.prototype, "check_frequency_minutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], ProjectSettings.prototype, "settings", void 0);
exports.ProjectSettings = ProjectSettings = __decorate([
    (0, typeorm_1.Entity)({ name: 'project_settings' })
], ProjectSettings);
