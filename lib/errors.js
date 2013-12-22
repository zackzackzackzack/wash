function TemplateSyntaxError() {
    Error.apply(this, arguments);
}
TemplateSyntaxError.prototype = new Error();
TemplateSyntaxError.prototype.constructor = TemplateSyntaxError;
TemplateSyntaxError.prototype.name = 'TemplateSyntaxError';

function UnknownIdentifierError() {
    Error.apply(this, arguments);
}
UnknownIdentifierError.prototype = new Error();
UnknownIdentifierError.prototype.constructor = UnknownIdentifierError;
UnknownIdentifierError.prototype.name = 'UnknownIdentifierError';

function InvalidTypeError() {
    Error.apply(this, arguments);
}
InvalidTypeError.prototype = new Error();
InvalidTypeError.prototype.constructor = InvalidTypeError;
InvalidTypeError.prototype.name = 'InvalidTypeError';

exports.TemplateSyntaxError = TemplateSyntaxError;
exports.UnknownIdentifierError = UnknownIdentifierError;
exports.InvalidTypeError = InvalidTypeError;