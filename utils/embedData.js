class EmbedData {
    _title = '';
    _description = '';
    _color = '';
    _fields = [];

    constructor(title, description = '', color = '98b0d6', fields) {
        this._title = title;
        this._description = description;
        this._color = color;
        this._fields = fields;
    }

    get fields() {
        return this._fields;
    }

    get color() {
        return this._color;
    }

    get description() {
        return this._description;
    }

    get title() {
        return this._title;
    }

    set title(title) {
        this._title = title;
    }

    set description(desc) {
        this._description = desc;
    }

    set color(color) {
        this._color = color;
    }

    set fields(fields) {
        this._fields = fields;
    }
}

module.exports = EmbedData;