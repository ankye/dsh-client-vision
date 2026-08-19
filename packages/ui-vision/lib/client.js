window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-vision",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let _deepseek_ai_dsh_client_runtime_client = require("@deepseek-ai/dsh-client-runtime/client");
		//#region \0dsh-css:/Users/a1021500561/work/deepseek-harness/packages/client/ui-vision/src/client/fields.module.css.mjs
		const css$1 = ".t7dRiq_field{flex-direction:column;gap:6px;padding:12px 0;display:flex}.t7dRiq_field+.t7dRiq_field{border-top:1px solid var(--dsw-alias-border-l2)}.t7dRiq_head{align-items:center;gap:8px;display:flex}.t7dRiq_label{min-width:0;color:var(--dsw-alias-label-primary);flex:1;font-size:13px;font-weight:500;line-height:1.5}.t7dRiq_badges{align-items:center;gap:8px;display:inline-flex}.t7dRiq_badge{white-space:nowrap;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary);border-radius:999px;padding:1px 8px;font-size:11px;font-weight:500;line-height:17px}.t7dRiq_badgeMuted{white-space:nowrap;color:var(--dsw-alias-label-tertiary);border-radius:999px;padding:1px 8px;font-size:11px;line-height:17px}.t7dRiq_reset{font:inherit;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;padding:0;font-size:12px;line-height:1.5}.t7dRiq_reset:hover:not(:disabled){color:var(--dsw-alias-label-primary)}.t7dRiq_reset:disabled{cursor:default}.t7dRiq_input{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);height:34px;font:inherit;color:var(--dsw-alias-label-primary);border-radius:8px;padding:0 12px;font-size:13px;line-height:1.5}.t7dRiq_input:focus-visible{border-color:var(--dsw-alias-brand-primary);outline:none}.t7dRiq_input:disabled{color:var(--dsw-alias-label-tertiary);cursor:default}.t7dRiq_inputInvalid{border-color:var(--dsw-alias-label-error);}.t7dRiq_invalid{color:var(--dsw-alias-label-error);margin:0;font-size:12px;line-height:1.5}.t7dRiq_hint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:1.5}";
		const tagId$1 = "@deepseek-ai/dsh-client-ui-vision/fields.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-vision";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var fields_module_css_default = {
			"inputInvalid": "t7dRiq_inputInvalid",
			"head": "t7dRiq_head",
			"input": "t7dRiq_input",
			"hint": "t7dRiq_hint",
			"invalid": "t7dRiq_invalid",
			"label": "t7dRiq_label",
			"badgeMuted": "t7dRiq_badgeMuted",
			"badges": "t7dRiq_badges",
			"badge": "t7dRiq_badge",
			"reset": "t7dRiq_reset",
			"field": "t7dRiq_field"
		};
		//#endregion
		//#region lib/types/client/fields.js
		/** A staged value field. */
		function ValueField(props) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: fields_module_css_default.field,
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: fields_module_css_default.head,
						children: [(0, react_jsx_runtime.jsx)("label", {
							className: fields_module_css_default.label,
							htmlFor: props.id,
							children: props.label
						}), props.overridden ? (0, react_jsx_runtime.jsxs)("span", {
							className: fields_module_css_default.badges,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: fields_module_css_default.badge,
								children: props.overriddenLabel
							}), (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: fields_module_css_default.reset,
								disabled: props.disabled,
								onClick: props.onReset,
								children: props.resetLabel
							})]
						}) : null]
					}),
					(0, react_jsx_runtime.jsx)("input", {
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
					(0, react_jsx_runtime.jsx)("p", {
						className: props.invalid ? fields_module_css_default.invalid : fields_module_css_default.hint,
						children: props.invalid ? props.invalidLabel : props.hint
					})
				]
			});
		}
		/** A write-only credential control. The value never rides a response. */
		function SecretField(props) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: fields_module_css_default.field,
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: fields_module_css_default.head,
						children: [(0, react_jsx_runtime.jsx)("label", {
							className: fields_module_css_default.label,
							htmlFor: props.id,
							children: props.label
						}), (0, react_jsx_runtime.jsx)("span", {
							className: fields_module_css_default.badges,
							children: (0, react_jsx_runtime.jsx)("span", {
								className: props.configured ? fields_module_css_default.badge : fields_module_css_default.badgeMuted,
								children: props.stateLabel
							})
						})]
					}),
					(0, react_jsx_runtime.jsx)("input", {
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
					(0, react_jsx_runtime.jsx)("p", {
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
			return (0, react_jsx_runtime.jsxs)("div", {
				className: fields_module_css_default.field,
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: fields_module_css_default.head,
						children: [(0, react_jsx_runtime.jsx)("label", {
							className: fields_module_css_default.label,
							htmlFor: props.id,
							children: props.label
						}), props.overridden ? (0, react_jsx_runtime.jsxs)("span", {
							className: fields_module_css_default.badges,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: fields_module_css_default.badge,
								children: props.overriddenLabel
							}), (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: fields_module_css_default.reset,
								disabled: props.disabled,
								onClick: props.onReset,
								children: props.resetLabel
							})]
						}) : null]
					}),
					(0, react_jsx_runtime.jsxs)("select", {
						id: props.id,
						className: fields_module_css_default.input,
						value: props.text,
						disabled: props.disabled,
						onChange: (event) => {
							props.onEdit(event.target.value);
						},
						children: [!known && props.text !== "" ? (0, react_jsx_runtime.jsx)("option", {
							value: props.text,
							disabled: true,
							children: props.text
						}) : null, props.options.map((option) => (0, react_jsx_runtime.jsx)("option", {
							value: option.value,
							children: option.label
						}, option.value))]
					}),
					(0, react_jsx_runtime.jsx)("p", {
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
		//#region \0dsh-css:/Users/a1021500561/work/deepseek-harness/packages/client/ui-vision/src/client/PluginCard.module.css.mjs
		const css = ".xS_YIG_card{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:12px;list-style:none;transition:border-color .16s,background .16s}.xS_YIG_card:hover{border-color:var(--dsw-alias-label-dimmed)}.xS_YIG_cardOpen{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-label-dimmed)}.xS_YIG_header{appearance:none;width:100%;font:inherit;color:inherit;text-align:left;cursor:pointer;background:0 0;border:0;border-radius:12px;align-items:center;gap:12px;padding:14px 16px;display:flex}.xS_YIG_header:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}.xS_YIG_headText{flex-direction:column;flex:1;gap:4px;min-width:0;display:flex}.xS_YIG_name{color:var(--dsw-alias-label-primary);font-size:15px;font-weight:600;line-height:1.4}.xS_YIG_description{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:1.5}.xS_YIG_chevron{color:var(--dsw-alias-label-tertiary);flex:none;transition:transform .16s}.xS_YIG_chevronOpen{transform:rotate(180deg)}.xS_YIG_body{border-top:1px solid var(--dsw-alias-border-l2);margin:0 16px;padding-bottom:8px}.xS_YIG_readOnly{color:var(--dsw-alias-label-tertiary);margin:12px 0 0;font-size:12px;line-height:1.5}.xS_YIG_pending{white-space:nowrap;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary);border-radius:999px;flex:none;padding:1px 8px;font-size:11px;font-weight:500;line-height:17px}.xS_YIG_footer{border-top:1px solid var(--dsw-alias-border-l2);justify-content:flex-end;align-items:center;gap:8px;padding:12px 0 4px;display:flex}.xS_YIG_failed{min-width:0;color:var(--dsw-alias-label-error);flex:1;margin:0;font-size:12px;line-height:1.5}.xS_YIG_discard,.xS_YIG_save{appearance:none;font:inherit;cursor:pointer;border:1px solid #0000;border-radius:8px;padding:5px 14px;font-size:13px;line-height:1.5}.xS_YIG_discard{border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);background:0 0}.xS_YIG_discard:hover:not(:disabled){color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-label-dimmed)}.xS_YIG_save{background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-layer-3)}.xS_YIG_discard:disabled,.xS_YIG_save:disabled{opacity:.4;cursor:default}.xS_YIG_discard:focus-visible,.xS_YIG_save:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}";
		const tagId = "@deepseek-ai/dsh-client-ui-vision/PluginCard.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-vision";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var PluginCard_module_css_default = {
			"footer": "xS_YIG_footer",
			"readOnly": "xS_YIG_readOnly",
			"discard": "xS_YIG_discard",
			"headText": "xS_YIG_headText",
			"chevron": "xS_YIG_chevron",
			"body": "xS_YIG_body",
			"card": "xS_YIG_card",
			"header": "xS_YIG_header",
			"pending": "xS_YIG_pending",
			"save": "xS_YIG_save",
			"name": "xS_YIG_name",
			"cardOpen": "xS_YIG_cardOpen",
			"chevronOpen": "xS_YIG_chevronOpen",
			"failed": "xS_YIG_failed",
			"description": "xS_YIG_description"
		};
		//#endregion
		//#region lib/types/client/PluginCard.js
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
			return (0, react_jsx_runtime.jsxs)("li", {
				className: clsx(PluginCard_module_css_default.card, open && PluginCard_module_css_default.cardOpen),
				children: [(0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: PluginCard_module_css_default.header,
					"aria-expanded": open,
					"aria-label": `${props.t(open ? "collapse" : "expand")}: ${title}`,
					onClick: () => {
						setOpen(!open);
					},
					children: [
						(0, react_jsx_runtime.jsxs)("span", {
							className: PluginCard_module_css_default.headText,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: PluginCard_module_css_default.name,
								children: title
							}), (0, react_jsx_runtime.jsx)("span", {
								className: PluginCard_module_css_default.description,
								children: props.t(props.descriptionKey)
							})]
						}),
						state.dirty ? (0, react_jsx_runtime.jsx)("span", {
							className: PluginCard_module_css_default.pending,
							children: props.t("unsaved")
						}) : null,
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutline14, { className: clsx(PluginCard_module_css_default.chevron, open && PluginCard_module_css_default.chevronOpen) })
					]
				}), open ? (0, react_jsx_runtime.jsxs)("div", {
					className: PluginCard_module_css_default.body,
					children: [
						!state.writable ? (0, react_jsx_runtime.jsx)("p", {
							className: PluginCard_module_css_default.readOnly,
							role: "status",
							children: props.t("readOnly")
						}) : null,
						props.children,
						(0, react_jsx_runtime.jsxs)("div", {
							className: PluginCard_module_css_default.footer,
							children: [
								state.failed ? (0, react_jsx_runtime.jsx)("p", {
									className: PluginCard_module_css_default.failed,
									role: "status",
									children: props.t("saveFailed")
								}) : null,
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: PluginCard_module_css_default.discard,
									disabled: !state.dirty || state.saving,
									onClick: props.onDiscard,
									children: props.t("discard")
								}),
								(0, react_jsx_runtime.jsx)("button", {
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
		//#region lib/types/client/card-form.js
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
				const store = (0, _deepseek_ai_dsh_client_runtime_client.createSnapshotStore)(project());
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
		//#region lib/types/client/vision-card-controller.js
		/**
		* The vision card's staged form over the `vision` settings namespace.
		*
		* The API key is the one control that does not live in the section: its
		* literal never rides a response, so the card learns only whether one is
		* configured and writes it through the credentials domain, addressed by the
		* reference the section names. Channel and model are enum selects, so adding a
		* recognition channel later is one option here and one section value.
		*/
		/** Namespace of the vision capability. Spelled here rather than imported. */
		const VISION_NS = "vision";
		/** Credential reference the provider resolves when the section names none. */
		const DEFAULT_API_KEY_REF = "VISION_GPT_API_KEY";
		/** Recognition channels offered by the current host package. */
		const VISION_CHANNELS = ["gpt"];
		/** Models offered by the `gpt` channel (aligned with the host's model list). */
		const VISION_MODELS = [
			"gpt-5.5",
			"gpt-5.6-sol",
			"gpt-5.6-terra"
		];
		/** Form field the credential control stages under. */
		const API_KEY_FIELD = "apiKey";
		/** Bridges the `vision` scope and the credentials domain onto the card. */
		var VisionCardController = class {
			scope;
			api;
			form;
			store;
			credential = {
				ref: "",
				configured: false,
				writable: true
			};
			/**
			* @param scope - the bound settings scope for the `vision` namespace.
			* @param api - wire face used for the credential the section references.
			*/
			constructor(scope, api) {
				this.scope = scope;
				this.api = api;
				this.form = new CardForm(scope, [
					selectField("channel", VISION_CHANNELS),
					textField("baseUrl"),
					selectField("model", VISION_MODELS)
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
				return {
					...this.form.shell(),
					channel: this.form.field("channel"),
					baseUrl: this.form.field("baseUrl"),
					model: this.form.field("model"),
					apiKey: this.form.field(API_KEY_FIELD),
					apiKeyConfigured: this.credential.configured,
					apiKeyWritable: this.credential.writable
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
					response = await this.api.credentials.describe({ refs: [ref] });
				} catch (_credentialReadFailure) {
					return;
				}
				if (!response.result.ok || ref !== refOf(this.scope.getSnapshot())) return;
				const view = response.result.value.credentials[ref];
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
					await this.api.credentials.set({
						ref: refOf(this.scope.getSnapshot()),
						value
					});
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
		//#region lib/types/client/VisionCard.js
		/** Visible labels for the channel options. */
		const CHANNEL_OPTIONS = VISION_CHANNELS.map((value) => ({
			value,
			label: value
		}));
		/** Visible labels for the model options. */
		const MODEL_OPTIONS = VISION_MODELS.map((value) => ({
			value,
			label: value
		}));
		/**
		* Render the vision card.
		* @param props - locale copy, the card snapshot, and its form actions.
		* @returns the card.
		*/
		function VisionCard(props) {
			const { t } = props;
			const state = props.useVisionCard((snapshot) => snapshot);
			const disabled = !state.writable;
			return (0, react_jsx_runtime.jsxs)(PluginCard, {
				t,
				titleKey: "title",
				descriptionKey: "description",
				state,
				onSave: props.save,
				onDiscard: props.discard,
				children: [
					(0, react_jsx_runtime.jsx)(SecretField, {
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
					}),
					(0, react_jsx_runtime.jsx)(ValueField, {
						id: "plugin-config-vision-endpoint",
						label: t("baseUrl"),
						hint: t("baseUrlHint"),
						placeholder: "https://token.uzstudio.com/v1",
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
					(0, react_jsx_runtime.jsx)(SelectField, {
						id: "plugin-config-vision-channel",
						label: t("channel"),
						hint: t("channelHint"),
						options: CHANNEL_OPTIONS,
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
					(0, react_jsx_runtime.jsx)(SelectField, {
						id: "plugin-config-vision-model",
						label: t("model"),
						hint: t("modelHint"),
						options: MODEL_OPTIONS,
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
		//#region lib/types/client/locales.js
		/** Locale bundles for the vision settings card (its own namespace). */
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
			channelHint: "Which external vision backend analyze_image dispatches to.",
			model: "Model",
			modelHint: "Which model the selected channel uses for recognition.",
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
			channelHint: "analyze_image 派发到哪个外部视觉后端。",
			model: "模型",
			modelHint: "当前通道识别时使用的模型。",
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
		//#region lib/types/client/index.js
		/**
		* Vision settings card, browser half — one card registered into the
		* configurable-plugins tab under the `vision` settings namespace.
		*
		* The tab (owned by ui-settings-plugins) enumerates Host-served namespaces
		* and dispatches cards by key; this package contributes only its own card and
		* locale. Cross-package collaboration goes through the service — the slot
		* declaration, the settings scope, the credentials domain — never a value
		* import (client bundle purity gate).
		*/
		/** Required services (cordis fiber inject). */
		const inject = [
			"slots",
			"locale",
			"connection",
			"remote",
			"settingsScope"
		];
		/**
		* Mount the vision settings card.
		* @param ctx - the browser plugin context.
		*/
		function apply(ctx) {
			const { api } = ctx.get("connection");
			ctx.effect(() => ctx.locale.register(VISION_NS, {
				zh,
				en
			}), "ui-vision: dictionaries");
			const vision = new VisionCardController(ctx.settingsScope.bind({ namespace: VISION_NS }), api);
			ctx.effect(() => ctx.remote.$on("credentials/updated", (ref) => {
				vision.refreshCredential(ref);
			}), "ui-vision: credential invalidations");
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