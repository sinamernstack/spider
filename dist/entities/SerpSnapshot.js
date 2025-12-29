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
exports.SerpSnapshot = void 0;
const typeorm_1 = require("typeorm");
let SerpSnapshot = class SerpSnapshot {
};
exports.SerpSnapshot = SerpSnapshot;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SerpSnapshot.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], SerpSnapshot.prototype, "rank_check_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], SerpSnapshot.prototype, "keyword_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint', nullable: true }),
    __metadata("design:type", Number)
], SerpSnapshot.prototype, "search_engine_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'char', length: 2, nullable: true }),
    __metadata("design:type", String)
], SerpSnapshot.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, nullable: true }),
    __metadata("design:type", String)
], SerpSnapshot.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], SerpSnapshot.prototype, "snapshot_json", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SerpSnapshot.prototype, "snapshot_hash", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], SerpSnapshot.prototype, "created_at", void 0);
exports.SerpSnapshot = SerpSnapshot = __decorate([
    (0, typeorm_1.Entity)({ name: 'serp_snapshots' })
], SerpSnapshot);
