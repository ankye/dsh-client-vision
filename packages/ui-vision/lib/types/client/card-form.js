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
import { createSnapshotStore } from '@deepseek-ai/dsh-client-runtime/client';
/** A free-text field. An empty draft clears the field. */
export function textField(field) {
    return {
        field,
        format: value => typeof value === 'string' ? value : '',
        parse: (text) => {
            const trimmed = text.trim();
            return trimmed === '' ? { kind: 'clear' } : { kind: 'set', value: trimmed };
        },
    };
}
/**
 * An enum field rendered as a select. A stored value the options no longer
 * list still renders, but only an offered option is accepted back.
 */
export function selectField(field, options) {
    return {
        field,
        format: value => typeof value === 'string' ? value : '',
        parse: (text) => options.includes(text) ? { kind: 'set', value: text } : undefined,
    };
}
/**
 * Stages one card's edits over one settings namespace and writes them on save.
 */
export class CardForm {
    scope;
    specs;
    secretSpecs;
    staged = new Map();
    listeners = new Set();
    saving = false;
    failed = false;
    constructor(scope, specs, secrets = []) {
        this.scope = scope;
        this.specs = new Map(specs.map(spec => [spec.field, spec]));
        this.secretSpecs = new Map(secrets.map(spec => [spec.field, spec]));
        scope.subscribe(() => { this.publish(); });
    }
    bind(project) {
        const store = createSnapshotStore(project());
        this.listeners.add(() => { store.set(project()); });
        return store;
    }
    shell() {
        const snapshot = this.scope.getSnapshot();
        const plan = this.plan();
        return {
            available: snapshot.status === 'ready',
            writable: snapshot.writable,
            dirty: plan.length > 0,
            invalid: plan.some(item => item.run === undefined),
            saving: this.saving,
            failed: this.failed,
        };
    }
    field(field) {
        const staged = this.staged.get(field);
        if (this.secretSpecs.has(field)) {
            return { text: staged?.text ?? '', overridden: false, invalid: false };
        }
        const spec = this.spec(field);
        if (staged === undefined) {
            return { text: spec.format(this.sectionValue(field)), overridden: this.stored(field), invalid: false };
        }
        const write = staged.clear ? { kind: 'clear' } : spec.parse(staged.text);
        return {
            text: staged.text,
            overridden: write?.kind === 'set',
            invalid: write === undefined,
        };
    }
    actions() {
        return {
            edit: (field, text) => { this.stage(field, { text, clear: false }); },
            resetField: (field) => {
                this.stage(field, { text: this.spec(field).format(this.baseValue(field)), clear: true });
            },
            save: () => { void this.save(); },
            discard: () => {
                if (this.staged.size === 0 && !this.failed)
                    return;
                this.staged.clear();
                this.failed = false;
                this.publish();
            },
        };
    }
    async save() {
        const plan = this.plan();
        const writes = plan.flatMap(item => item.run === undefined ? [] : [item.run]);
        if (plan.length === 0 || this.saving || writes.length !== plan.length)
            return;
        this.saving = true;
        this.failed = false;
        this.publish();
        let landed = true;
        for (const write of writes) {
            landed = await write() && landed;
        }
        if (landed)
            this.staged.clear();
        this.saving = false;
        this.failed = !landed;
        this.publish();
    }
    plan() {
        const plan = [];
        for (const [field, staged] of this.staged) {
            const secret = this.secretSpecs.get(field);
            if (secret !== undefined) {
                const value = staged.text.trim();
                if (value !== '')
                    plan.push({ field, run: () => secret.write(value) });
                continue;
            }
            const spec = this.spec(field);
            if (staged.clear) {
                if (this.stored(field))
                    plan.push({ field, run: () => this.clear(field) });
                continue;
            }
            if (staged.text === spec.format(this.sectionValue(field)))
                continue;
            const write = spec.parse(staged.text);
            if (write === undefined)
                plan.push({ field, run: undefined });
            else if (write.kind === 'clear')
                plan.push({ field, run: () => this.clear(field) });
            else
                plan.push({ field, run: () => this.store(field, write.value) });
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
        if (spec === undefined)
            throw new Error(`plugin card has no field ${field}`);
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
        return user !== undefined && Object.hasOwn(user, field);
    }
    publish() {
        for (const listener of this.listeners)
            listener();
    }
}
//# sourceMappingURL=card-form.js.map