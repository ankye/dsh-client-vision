window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-vision",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
		//#region \0dsh-css:/Users/a1021500932/work/deepseek-harness/packages/client/ui-vision/src/client/fields.module.css.mjs
		const css$1 = ".cpOOmW_field{flex-direction:column;gap:6px;padding:12px 0;display:flex}.cpOOmW_field+.cpOOmW_field{border-top:1px solid var(--dsw-alias-border-l2)}.cpOOmW_head{align-items:center;gap:8px;display:flex}.cpOOmW_label{min-width:0;color:var(--dsw-alias-label-primary);flex:1;font-size:13px;font-weight:500;line-height:1.5}.cpOOmW_badges{align-items:center;gap:8px;display:inline-flex}.cpOOmW_badge{white-space:nowrap;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary);border-radius:999px;padding:1px 8px;font-size:11px;font-weight:500;line-height:17px}.cpOOmW_badgeMuted{white-space:nowrap;color:var(--dsw-alias-label-tertiary);border-radius:999px;padding:1px 8px;font-size:11px;line-height:17px}.cpOOmW_reset{font:inherit;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;padding:0;font-size:12px;line-height:1.5}.cpOOmW_reset:hover:not(:disabled){color:var(--dsw-alias-label-primary)}.cpOOmW_reset:disabled{cursor:default}.cpOOmW_input{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);height:34px;font:inherit;color:var(--dsw-alias-label-primary);border-radius:8px;padding:0 12px;font-size:13px;line-height:1.5}.cpOOmW_input:focus-visible{border-color:var(--dsw-alias-brand-primary);outline:none}.cpOOmW_input:disabled{color:var(--dsw-alias-label-tertiary);cursor:default}.cpOOmW_inputInvalid{border-color:var(--dsw-alias-label-error);}.cpOOmW_invalid{color:var(--dsw-alias-label-error);margin:0;font-size:12px;line-height:1.5}.cpOOmW_hint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:1.5}";
		const tagId$1 = "@deepseek-ai/dsh-client-ui-vision/fields.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-vision";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var fields_module_css_default = {
			"badge": "cpOOmW_badge",
			"badgeMuted": "cpOOmW_badgeMuted",
			"badges": "cpOOmW_badges",
			"field": "cpOOmW_field",
			"head": "cpOOmW_head",
			"hint": "cpOOmW_hint",
			"input": "cpOOmW_input",
			"inputInvalid": "cpOOmW_inputInvalid",
			"invalid": "cpOOmW_invalid",
			"label": "cpOOmW_label",
			"reset": "cpOOmW_reset"
		};
		//#endregion
		//#region src/client/fields.tsx
		/** A staged value field. */
		function ValueField(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: fields_module_css_default.field,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: fields_module_css_default.head,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
							className: fields_module_css_default.label,
							htmlFor: props.id,
							children: props.label
						}), props.overridden ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: fields_module_css_default.badges,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: fields_module_css_default.badge,
								children: props.overriddenLabel
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: fields_module_css_default.reset,
								disabled: props.disabled,
								onClick: props.onReset,
								children: props.resetLabel
							})]
						}) : null]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						id: props.id,
						className: props.invalid ? fields_module_css_default.inputInvalid : fields_module_css_default.input,
						type: "text",
						...props.numeric === true ? { inputMode: "numeric" } : {},
						...props.invalid ? { "aria-invalid": true } : {},
						value: props.text,
						placeholder: props.placeholder ?? "",
						disabled: props.disabled,
						onChange: (event) => {
							props.onEdit(event.target.value);
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: props.invalid ? fields_module_css_default.invalid : fields_module_css_default.hint,
						children: props.invalid ? props.invalidLabel : props.hint
					})
				]
			});
		}
		/** A write-only credential control. The value never rides a response. */
		function SecretField(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: fields_module_css_default.field,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: fields_module_css_default.head,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
							className: fields_module_css_default.label,
							htmlFor: props.id,
							children: props.label
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: fields_module_css_default.badges,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: props.configured ? fields_module_css_default.badge : fields_module_css_default.badgeMuted,
								children: props.stateLabel
							})
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						id: props.id,
						className: fields_module_css_default.input,
						type: "password",
						autoComplete: "off",
						value: props.text,
						disabled: props.disabled,
						onChange: (event) => {
							props.onEdit(event.target.value);
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: fields_module_css_default.hint,
						children: props.hint
					})
				]
			});
		}
		/**
		* A staged enum control. The select always carries one of the offered options;
		* a draft naming a value the options no longer list still renders so the user
		* can see what the section holds, and saving it back is refused until it names
		* an offered option.
		*/
		function SelectField(props) {
			const known = props.options.some((option) => option.value === props.text);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: fields_module_css_default.field,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: fields_module_css_default.head,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
							className: fields_module_css_default.label,
							htmlFor: props.id,
							children: props.label
						}), props.overridden ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: fields_module_css_default.badges,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: fields_module_css_default.badge,
								children: props.overriddenLabel
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: fields_module_css_default.reset,
								disabled: props.disabled,
								onClick: props.onReset,
								children: props.resetLabel
							})]
						}) : null]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
						id: props.id,
						className: fields_module_css_default.input,
						value: props.text,
						disabled: props.disabled,
						onChange: (event) => {
							props.onEdit(event.target.value);
						},
						children: [!known && props.text !== "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
							value: props.text,
							disabled: true,
							children: props.text
						}) : null, props.options.map((option) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
							value: option.value,
							children: option.label
						}, option.value))]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: fields_module_css_default.hint,
						children: props.hint
					})
				]
			});
		}
		//#endregion
		//#region ../../../node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
		function r(e) {
			var t, f, n = "";
			if ("string" == typeof e || "number" == typeof e) n += e;
			else if ("object" == typeof e) if (Array.isArray(e)) {
				var o = e.length;
				for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
			} else for (f in e) e[f] && (n && (n += " "), n += f);
			return n;
		}
		function clsx() {
			for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
			return n;
		}
		//#endregion
		//#region \0dsh-css:/Users/a1021500932/work/deepseek-harness/packages/client/ui-vision/src/client/PluginCard.module.css.mjs
		const css = ".q3zCpG_card{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:12px;list-style:none;transition:border-color .16s,background .16s}.q3zCpG_card:hover{border-color:var(--dsw-alias-label-dimmed)}.q3zCpG_cardOpen{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-label-dimmed)}.q3zCpG_header{appearance:none;width:100%;font:inherit;color:inherit;text-align:left;cursor:pointer;background:0 0;border:0;border-radius:12px;align-items:center;gap:12px;padding:14px 16px;display:flex}.q3zCpG_header:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}.q3zCpG_headText{flex-direction:column;flex:1;gap:4px;min-width:0;display:flex}.q3zCpG_name{color:var(--dsw-alias-label-primary);font-size:15px;font-weight:600;line-height:1.4}.q3zCpG_description{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:1.5}.q3zCpG_chevron{color:var(--dsw-alias-label-tertiary);flex:none;transition:transform .16s}.q3zCpG_chevronOpen{transform:rotate(180deg)}.q3zCpG_body{border-top:1px solid var(--dsw-alias-border-l2);margin:0 16px;padding-bottom:8px}.q3zCpG_readOnly{color:var(--dsw-alias-label-tertiary);margin:12px 0 0;font-size:12px;line-height:1.5}.q3zCpG_pending{white-space:nowrap;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary);border-radius:999px;flex:none;padding:1px 8px;font-size:11px;font-weight:500;line-height:17px}.q3zCpG_footer{border-top:1px solid var(--dsw-alias-border-l2);justify-content:flex-end;align-items:center;gap:8px;padding:12px 0 4px;display:flex}.q3zCpG_failed{min-width:0;color:var(--dsw-alias-label-error);flex:1;margin:0;font-size:12px;line-height:1.5}.q3zCpG_discard,.q3zCpG_save{appearance:none;font:inherit;cursor:pointer;border:1px solid #0000;border-radius:8px;padding:5px 14px;font-size:13px;line-height:1.5}.q3zCpG_discard{border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);background:0 0}.q3zCpG_discard:hover:not(:disabled){color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-label-dimmed)}.q3zCpG_save{background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-layer-3)}.q3zCpG_discard:disabled,.q3zCpG_save:disabled{opacity:.4;cursor:default}.q3zCpG_discard:focus-visible,.q3zCpG_save:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}";
		const tagId = "@deepseek-ai/dsh-client-ui-vision/PluginCard.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-vision";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var PluginCard_module_css_default = {
			"body": "q3zCpG_body",
			"card": "q3zCpG_card",
			"cardOpen": "q3zCpG_cardOpen",
			"chevron": "q3zCpG_chevron",
			"chevronOpen": "q3zCpG_chevronOpen",
			"description": "q3zCpG_description",
			"discard": "q3zCpG_discard",
			"failed": "q3zCpG_failed",
			"footer": "q3zCpG_footer",
			"headText": "q3zCpG_headText",
			"header": "q3zCpG_header",
			"name": "q3zCpG_name",
			"pending": "q3zCpG_pending",
			"readOnly": "q3zCpG_readOnly",
			"save": "q3zCpG_save"
		};
		//#endregion
		//#region src/client/PluginCard.tsx
		/**
		* One plugin's card: a header naming the plugin and what its settings govern,
		* disclosing that plugin's controls in place, with the save that writes them
		* (self-contained copy; the bundle purity gate forbids importing another
		* client package's chrome).
		*/
		/**
		* Render one plugin card.
		* @param props - the plugin's copy keys, its form state, and its controls.
		* @returns the card, or nothing when the namespace is unavailable.
		*/
		function PluginCard(props) {
			const [open, setOpen] = (0, react.useState)(false);
			const { state } = props;
			if (!state.available) return null;
			const title = props.t(props.titleKey);
			const blocked = !state.dirty || state.invalid || state.saving;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
				className: clsx(PluginCard_module_css_default.card, open && PluginCard_module_css_default.cardOpen),
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: PluginCard_module_css_default.header,
					"aria-expanded": open,
					"aria-label": `${props.t(open ? "collapse" : "expand")}: ${title}`,
					onClick: () => {
						setOpen(!open);
					},
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: PluginCard_module_css_default.headText,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: PluginCard_module_css_default.name,
								children: title
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: PluginCard_module_css_default.description,
								children: props.t(props.descriptionKey)
							})]
						}),
						state.dirty ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: PluginCard_module_css_default.pending,
							children: props.t("unsaved")
						}) : null,
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutline14, { className: clsx(PluginCard_module_css_default.chevron, open && PluginCard_module_css_default.chevronOpen) })
					]
				}), open ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: PluginCard_module_css_default.body,
					children: [
						!state.writable ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: PluginCard_module_css_default.readOnly,
							role: "status",
							children: props.t("readOnly")
						}) : null,
						props.children,
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: PluginCard_module_css_default.footer,
							children: [
								state.failed ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: PluginCard_module_css_default.failed,
									role: "status",
									children: props.t("saveFailed")
								}) : null,
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: PluginCard_module_css_default.discard,
									disabled: !state.dirty || state.saving,
									onClick: props.onDiscard,
									children: props.t("discard")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: PluginCard_module_css_default.save,
									disabled: blocked,
									onClick: props.onSave,
									children: props.t(state.saving ? "saving" : "save")
								})
							]
						})
					]
				}) : null]
			});
		}
		//#endregion
		//#region src/client/card-form.ts
		/**
		* Shared form model behind the vision card (self-contained copy; the
		* browser bundle purity gate forbids importing it from another client
		* package).
		*
		* A card stages what the user types and writes it only when they save. Each
		* settings write is a durable, revision-fenced document mutation, so a control
		* that committed as it settled turned one edit into a write the user never
		* asked for and could not preview; staged text makes what is on screen exactly
		* what a save would store.
		*/
		/** A free-text field. An empty draft clears the field. */
		function textField(field) {
			return {
				field,
				format: (value) => typeof value === "string" ? value : "",
				parse: (text) => {
					const trimmed = text.trim();
					return trimmed === "" ? { kind: "clear" } : {
						kind: "set",
						value: trimmed
					};
				}
			};
		}
		/**
		* An enum field rendered as a select. A stored value the options no longer
		* list still renders, but only an offered option is accepted back.
		*/
		function selectField(field, options) {
			return {
				field,
				format: (value) => typeof value === "string" ? value : "",
				parse: (text) => options.includes(text) ? {
					kind: "set",
					value: text
				} : void 0
			};
		}
		/**
		* Stages one card's edits over one settings namespace and writes them on save.
		*/
		var CardForm = class {
			scope;
			specs;
			secretSpecs;
			staged = /* @__PURE__ */ new Map();
			listeners = /* @__PURE__ */ new Set();
			saving = false;
			failed = false;
			constructor(scope, specs, secrets = []) {
				this.scope = scope;
				this.specs = new Map(specs.map((spec) => [spec.field, spec]));
				this.secretSpecs = new Map(secrets.map((spec) => [spec.field, spec]));
				scope.subscribe(() => {
					this.publish();
				});
			}
			bind(project) {
				const store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(project());
				this.listeners.add(() => {
					store.set(project());
				});
				return store;
			}
			shell() {
				const snapshot = this.scope.getSnapshot();
				const plan = this.plan();
				return {
					available: snapshot.status === "ready",
					writable: snapshot.writable,
					dirty: plan.length > 0,
					invalid: plan.some((item) => item.run === void 0),
					saving: this.saving,
					failed: this.failed
				};
			}
			field(field) {
				const staged = this.staged.get(field);
				if (this.secretSpecs.has(field)) return {
					text: staged?.text ?? "",
					overridden: false,
					invalid: false
				};
				const spec = this.spec(field);
				if (staged === void 0) return {
					text: spec.format(this.sectionValue(field)),
					overridden: this.stored(field),
					invalid: false
				};
				const write = staged.clear ? { kind: "clear" } : spec.parse(staged.text);
				return {
					text: staged.text,
					overridden: write?.kind === "set",
					invalid: write === void 0
				};
			}
			actions() {
				return {
					edit: (field, text) => {
						this.stage(field, {
							text,
							clear: false
						});
					},
					resetField: (field) => {
						this.stage(field, {
							text: this.spec(field).format(this.baseValue(field)),
							clear: true
						});
					},
					save: () => {
						this.save();
					},
					discard: () => {
						if (this.staged.size === 0 && !this.failed) return;
						this.staged.clear();
						this.failed = false;
						this.publish();
					}
				};
			}
			async save() {
				const plan = this.plan();
				const writes = plan.flatMap((item) => item.run === void 0 ? [] : [item.run]);
				if (plan.length === 0 || this.saving || writes.length !== plan.length) return;
				this.saving = true;
				this.failed = false;
				this.publish();
				let landed = true;
				for (const write of writes) landed = await write() && landed;
				if (landed) this.staged.clear();
				this.saving = false;
				this.failed = !landed;
				this.publish();
			}
			plan() {
				const plan = [];
				for (const [field, staged] of this.staged) {
					const secret = this.secretSpecs.get(field);
					if (secret !== void 0) {
						const value = staged.text.trim();
						if (value !== "") plan.push({
							field,
							run: () => secret.write(value)
						});
						continue;
					}
					const spec = this.spec(field);
					if (staged.clear) {
						if (this.stored(field)) plan.push({
							field,
							run: () => this.clear(field)
						});
						continue;
					}
					if (staged.text === spec.format(this.sectionValue(field))) continue;
					const write = spec.parse(staged.text);
					if (write === void 0) plan.push({
						field,
						run: void 0
					});
					else if (write.kind === "clear") plan.push({
						field,
						run: () => this.clear(field)
					});
					else plan.push({
						field,
						run: () => this.store(field, write.value)
					});
				}
				return plan;
			}
			async clear(field) {
				await this.scope.unset(field);
				return !this.stored(field);
			}
			async store(field, value) {
				await this.scope.set(field, value);
				return this.userLayer()?.[field] === value;
			}
			stage(field, edit) {
				this.staged.set(field, edit);
				this.failed = false;
				this.publish();
			}
			spec(field) {
				const spec = this.specs.get(field);
				if (spec === void 0) throw new Error(`plugin card has no field ${field}`);
				return spec;
			}
			snapshotOf() {
				return this.scope.getSnapshot();
			}
			sectionValue(field) {
				return this.snapshotOf().value?.[field];
			}
			baseValue(field) {
				return this.snapshotOf().base?.[field];
			}
			userLayer() {
				return this.snapshotOf().user;
			}
			stored(field) {
				const user = this.userLayer();
				return user !== void 0 && Object.hasOwn(user, field);
			}
			publish() {
				for (const listener of this.listeners) listener();
			}
		};
		//#endregion
		//#region src/client/vision-card-controller.ts
		/** Namespace of the vision capability. Spelled here rather than imported. */
		const VISION_NS = "vision";
		/** Credential reference the provider resolves when the section names none. */
		const DEFAULT_API_KEY_REF = "VISION_GPT_API_KEY";
		/** Recognition channels offered by the current host package. */
		const VISION_CHANNELS = [
			"gpt",
			"zhipu",
			"ollama"
		];
		/**
		* Models offered per channel (aligned with the host package's model lists).
		* The model control is free-text; these lists drive the dropdown options and
		* switch with the selected channel.
		*/
		const VISION_MODEL_LISTS = {
			gpt: [
				"gpt-5.5",
				"gpt-5.6-sol",
				"gpt-5.6-terra"
			],
			zhipu: ["glm-4v-plus", "glm-4v-flash"],
			ollama: [
				"llava",
				"llava-llama3",
				"bakllava",
				"moondream",
				"qwen2-vl",
				"minicpm-v"
			]
		};
		/** Form field the credential control stages under. */
		const API_KEY_FIELD = "apiKey";
		/** Bridges the `vision` scope and the credentials domain onto the card. */
		var VisionCardController = class {
			scope;
			credentials;
			form;
			store;
			credential = {
				ref: "",
				configured: false,
				writable: true
			};
			/**
			* @param scope - the bound settings scope for the `vision` namespace.
			* @param credentials - Remote face used for the credential the section references.
			*/
			constructor(scope, credentials) {
				this.scope = scope;
				this.credentials = credentials;
				this.form = new CardForm(scope, [
					selectField("channel", VISION_CHANNELS),
					textField("baseUrl"),
					textField("model")
				], [{
					field: API_KEY_FIELD,
					write: (text) => this.writeKey(text)
				}]);
				this.store = this.form.bind(() => this.projection());
				scope.subscribe(() => {
					this.readCredential();
				});
				this.readCredential();
			}
			projection() {
				const channel = this.form.field("channel").text || "gpt";
				return {
					...this.form.shell(),
					channel: this.form.field("channel"),
					baseUrl: this.form.field("baseUrl"),
					model: this.form.field("model"),
					apiKey: this.form.field(API_KEY_FIELD),
					apiKeyConfigured: this.credential.configured,
					apiKeyWritable: channel === "ollama" ? false : this.credential.writable,
					modelOptions: VISION_MODEL_LISTS[channel] ?? VISION_MODEL_LISTS.gpt ?? [],
					keyVisible: channel !== "ollama"
				};
			}
			/**
			* Ask the credentials domain about the reference the section currently names.
			*
			* The answer is stored with the reference it describes: `apiKeyEnv` can
			* change between the request and its response, and two reads can settle out
			* of order, so a response is published only while it still answers for the
			* reference in force.
			*/
			async readCredential() {
				const ref = refOf(this.scope.getSnapshot());
				if (ref !== this.credential.ref) {
					this.credential = {
						ref,
						configured: false,
						writable: true
					};
					this.store.set(this.projection());
				}
				let response;
				try {
					response = await this.credentials.describe([ref]);
				} catch (_credentialReadFailure) {
					return;
				}
				if (!response.ok || ref !== refOf(this.scope.getSnapshot())) return;
				const view = response.value[ref];
				const next = {
					ref,
					configured: view?.configured ?? false,
					writable: view?.writable ?? true
				};
				if (next.configured === this.credential.configured && next.writable === this.credential.writable) return;
				this.credential = next;
				this.store.set(this.projection());
			}
			/**
			* Re-read after the Host reports a change to the reference this card watches.
			* @param ref - the reference the Host reports as changed.
			*/
			refreshCredential(ref) {
				if (ref !== this.credential.ref) return;
				this.readCredential();
			}
			/**
			* Build the face the card's slot registration injects.
			* @returns the card's snapshot and its form actions.
			*/
			inject() {
				return {
					hooks: { visionCard: this.store },
					...this.form.actions()
				};
			}
			/**
			* Write the staged key, then re-read whether the Host now holds one.
			* @param value - the staged credential literal.
			* @returns whether the Host reports a configured credential afterwards.
			*/
			async writeKey(value) {
				try {
					await this.credentials.set(refOf(this.scope.getSnapshot()), value);
				} catch (_credentialWriteFailure) {}
				await this.readCredential();
				return this.credential.configured;
			}
		};
		/**
		* The credential reference the section names, or the provider's default.
		* @param snapshot - the current scope snapshot.
		* @returns the reference to address.
		*/
		function refOf(snapshot) {
			const declared = snapshot.value?.apiKeyEnv;
			return declared !== void 0 && declared.length > 0 ? declared : DEFAULT_API_KEY_REF;
		}
		//#endregion
		//#region src/client/VisionCard.tsx
		/** Visible labels for the channel options. */
		const CHANNEL_OPTIONS = [
			{
				value: "gpt",
				label: "GPT"
			},
			{
				value: "zhipu",
				label: "Zhipu GLM-4V"
			},
			{
				value: "ollama",
				label: "Ollama (local)"
			}
		];
		/**
		* Render the vision card.
		* @param props - locale copy, the card snapshot, and its form actions.
		* @returns the card.
		*/
		function VisionCard(props) {
			const { t } = props;
			const state = props.useVisionCard((snapshot) => snapshot);
			const disabled = !state.writable;
			const modelOptions = state.modelOptions.map((value) => ({
				value,
				label: value
			}));
			const channelOptions = CHANNEL_OPTIONS.filter((option) => VISION_CHANNELS.includes(option.value));
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(PluginCard, {
				t,
				titleKey: "title",
				descriptionKey: "description",
				state,
				onSave: props.save,
				onDiscard: props.discard,
				children: [
					state.keyVisible ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SecretField, {
						id: "plugin-config-vision-key",
						label: t("apiKey"),
						hint: t("apiKeyHint"),
						disabled: !state.apiKeyWritable,
						text: state.apiKey.text,
						configured: state.apiKeyConfigured,
						stateLabel: state.apiKeyConfigured ? t("apiKeySet") : t("apiKeyUnset"),
						onEdit: (text) => {
							props.edit("apiKey", text);
						}
					}) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ValueField, {
						id: "plugin-config-vision-endpoint",
						label: t("baseUrl"),
						hint: t("baseUrlHint"),
						placeholder: "https://api.example.com/v1",
						overriddenLabel: t("overridden"),
						resetLabel: t("reset"),
						invalidLabel: t("invalidNumber"),
						disabled,
						...state.baseUrl,
						onEdit: (text) => {
							props.edit("baseUrl", text);
						},
						onReset: () => {
							props.resetField("baseUrl");
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SelectField, {
						id: "plugin-config-vision-channel",
						label: t("channel"),
						hint: t("channelHint"),
						options: channelOptions,
						overriddenLabel: t("overridden"),
						resetLabel: t("reset"),
						invalidLabel: t("invalidNumber"),
						disabled,
						...state.channel,
						onEdit: (text) => {
							props.edit("channel", text);
						},
						onReset: () => {
							props.resetField("channel");
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SelectField, {
						id: "plugin-config-vision-model",
						label: t("model"),
						hint: t("modelHint"),
						options: modelOptions,
						overriddenLabel: t("overridden"),
						resetLabel: t("reset"),
						invalidLabel: t("invalidNumber"),
						disabled,
						...state.model,
						onEdit: (text) => {
							props.edit("model", text);
						},
						onReset: () => {
							props.resetField("model");
						}
					})
				]
			});
		}
		//#endregion
		//#region src/client/ViewImageToolView.tsx
		/** Marker line the host render emits for screenshot results. */
		const SHOT_MARKER = /\[view-image: ([^\]]+)\]/;
		/**
		* Render the view_image call card.
		* @param props - the tool call block and locale.
		* @returns the image + description, or plain text when no screenshot marker.
		*/
		function ViewImageToolView(props) {
			const block = props.block;
			if (!("kind" in block) || block.kind !== "tool-result") return null;
			const text = block.content.filter((b) => b.type === "text").map((b) => b.text).join("\n");
			const match = SHOT_MARKER.exec(text);
			if (match === null) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
				style: { whiteSpace: "pre-wrap" },
				children: text
			});
			const url = match[1];
			const description = text.replace(SHOT_MARKER, "").trim();
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
				src: url,
				alt: "view-image",
				style: {
					maxWidth: "100%",
					borderRadius: 8,
					display: "block"
				}
			}), description !== "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: description }) : null] });
		}
		//#endregion
		//#region src/client/locales.ts
		/** English copy. */
		const en = {
			title: "Vision",
			description: "Screen capture and external image recognition.",
			apiKey: "API key",
			apiKeyHint: "Stored outside the settings file. Leave blank to keep the current key.",
			apiKeySet: "A key is configured.",
			apiKeyUnset: "No key is configured; recognition is unavailable until one is.",
			baseUrl: "Endpoint",
			baseUrlHint: "Domain and optional path prefix; /chat/completions is appended.",
			channel: "Recognition channel",
			channelHint: "Which backend analyze_image dispatches to: GPT (OpenAI-compatible), Zhipu GLM-4V, or a local Ollama model.",
			model: "Model",
			modelHint: "Which model the selected channel uses for recognition (free text; the dropdown lists each channel's common models).",
			overridden: "Overridden",
			reset: "Reset to default",
			readOnly: "This deployment stores settings read-only.",
			expand: "Show settings",
			collapse: "Hide settings",
			save: "Save",
			saving: "Saving…",
			discard: "Discard",
			unsaved: "Unsaved",
			saveFailed: "The deployment did not accept these values; they were left for you to correct.",
			invalidNumber: "Enter a number, or leave blank to use the default."
		};
		/** Simplified Chinese copy. */
		const zh = {
			title: "图像识别",
			description: "屏幕截图与外部图像识别。",
			apiKey: "API Key",
			apiKeyHint: "不写入设置文件。留空表示保持当前密钥。",
			apiKeySet: "已配置密钥。",
			apiKeyUnset: "未配置密钥；配置之前识别不可用。",
			baseUrl: "接口地址",
			baseUrlHint: "域名与可选路径前缀；会自动拼接 /chat/completions。",
			channel: "识别通道",
			channelHint: "analyze_image 派发到哪个后端：GPT（OpenAI 兼容）、智谱 GLM-4V 或本地 Ollama 模型。",
			model: "模型",
			modelHint: "当前通道识别时使用的模型（可自由输入；下拉列出各通道常用模型）。",
			overridden: "已覆盖",
			reset: "恢复默认",
			readOnly: "本部署的设置为只读。",
			expand: "展开设置",
			collapse: "收起设置",
			save: "保存",
			saving: "保存中…",
			discard: "放弃修改",
			unsaved: "未保存",
			saveFailed: "本部署没有接受这些值，已保留供你修改。",
			invalidNumber: "请填数字；留空表示使用默认值。"
		};
		//#endregion
		//#region src/client/index.ts
		/** Required services (cordis fiber inject). */
		const inject = [
			"slots",
			"locale",
			"remote",
			"remote.credentials",
			"settingsScope"
		];
		/**
		* Mount the vision settings card.
		* @param ctx - the browser plugin context.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(VISION_NS, {
				zh,
				en
			}), "ui-vision: dictionaries");
			const vision = new VisionCardController(ctx.settingsScope.bind({ namespace: VISION_NS }), ctx.remote.credentials);
			ctx.effect(() => ctx.remote.$on("credentials/reference-updated", (ref) => {
				vision.refreshCredential(ref);
			}), "ui-vision: credential invalidations");
			ctx.slots.inject("tool.call.toolview", () => ctx.slots.register({
				name: "tool.call.toolview",
				key: "view_image",
				locale: VISION_NS
			}, ViewImageToolView));
			ctx.slots.inject("settings.plugin.item", () => ctx.slots.register({
				name: "settings.plugin.item",
				key: VISION_NS,
				locale: VISION_NS,
				inject: () => vision.inject()
			}, VisionCard));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map