var Atos = Atos || {};

Atos.FormRenderSetup = function () {

	var options = {};
	options.Templates = {};
    options.OnPreRender = Atos.FormOnPreRender;

	SPClientTemplates.TemplateManager.RegisterTemplateOverrides(options);
};

Atos.FormOnPreRender = function (ctx) {
    var fieldName = ctx.ListSchema.Field[0].Name,
        fieldType = ctx.ListSchema.Field[0].FieldType;

    switch (fieldType) {
        case "Boolean":
            ctx.Templates.Fields[fieldName] = Atos.BooleanRenderer;
            break;
        case "Text":
            ctx.Templates.Fields[fieldName] = Atos.TextRenderer;
            break;
        case "Choice":
            ctx.Templates.Fields[fieldName] = Atos.ChoiceRenderer;
            break;
        default:
            // Let the default function handle it
            break;
    }
};

/* Renderers */

Atos.BooleanRenderer = function (ctx) {

    var formCtx = SPClientTemplates.Utility.GetFormContextForCurrentField(ctx),
        cbxId = 'cbx_' + formCtx.fieldName,
        errMbId = 'errMb_' + formCtx.fieldName,
        errMbtId = 'errMbt_' + formCtx.fieldName;

	formCtx.registerGetValueCallback(formCtx.fieldName, Atos.BooleanGetValueCallback.bind(null, cbxId));

    formCtx.registerValidationErrorCallback(formCtx.fieldName, Atos.ValidationErrorCallback.bind(null, formCtx.fieldSchema["Title"], errMbId, errMbtId));

    return '<div class="ms-CheckBox"> \
                <input tabindex="-1" type="checkbox" class="ms-CheckBox-input" id="' + cbxId + '"> \
                <label role="checkbox" class="ms-CheckBox-field" tabindex="0" aria-checked="false"> \
                    <span class="ms-Label"></span> \
                </label> \
            </div> \
            <div class="ms-MessageBar ms-MessageBar--error" style="display:none;" id="' + errMbId +'"> \
                <div class="ms-MessageBar-content"> \
                    <div class="ms-MessageBar-text" id="' + errMbtId + '"></div> \
                </div> \
            </div>';
};

Atos.BooleanGetValueCallback = function (controlId) {
    return document.getElementById(controlId).checked;
};

Atos.TextRenderer = function (ctx) {

    var formCtx = SPClientTemplates.Utility.GetFormContextForCurrentField(ctx),
        tbId = 'tb_' + formCtx.fieldName,
        errMbId = 'errMb_' + formCtx.fieldName,
        errMbtId = 'errMbt_' + formCtx.fieldName;

	formCtx.registerGetValueCallback(formCtx.fieldName, Atos.TextGetValueCallback.bind(null, tbId));

    formCtx.registerValidationErrorCallback(formCtx.fieldName, Atos.ValidationErrorCallback.bind(null, formCtx.fieldSchema["Title"], errMbId, errMbtId));

    return '<div class="ms-TextField ms-TextField--placeholder"> \
                <label class="ms-Label">' + (formCtx.fieldValue ? "" : formCtx.fieldSchema["Title"]) + '</label> \
                <input class="ms-TextField-field" type="text" value="' + formCtx.fieldValue + '" placeholder="" id="' + tbId + '"> \
            </div> \
            <div class="ms-MessageBar ms-MessageBar--error" style="display:none;" id="' + errMbId +'"> \
                <div class="ms-MessageBar-content"> \
                    <div class="ms-MessageBar-text" id="' + errMbtId + '"></div> \
                </div> \
            </div>';
};

Atos.TextGetValueCallback = function (controlId) {
    return document.getElementById(controlId).value;
};

Atos.ChoiceRenderer = function (ctx) {
    var formCtx = SPClientTemplates.Utility.GetFormContextForCurrentField(ctx),
        cId = 'choice_' + formCtx.fieldName,
        errMbId = 'errMb_' + formCtx.fieldName,
        errMbtId = 'errMbt_' + formCtx.fieldName;

	formCtx.registerGetValueCallback(formCtx.fieldName, Atos.ChoiceGetValueCallback.bind(null, cId, formCtx.fieldSchema.FormatType));

    formCtx.registerValidationErrorCallback(formCtx.fieldName, Atos.ValidationErrorCallback.bind(null, formCtx.fieldSchema["Title"], errMbId, errMbtId));

    if (formCtx.fieldSchema.FormatType == SPClientTemplates.ChoiceFormatType.Dropdown) {
        var choices = [];
        for (var i = 0; i < formCtx.fieldSchema.Choices.length; ++i) {
            var value = formCtx.fieldSchema.Choices[i];

            choices.push('<option value="');
            choices.push(value);
            choices.push('">');
            choices.push(value);
            choices.push('</option>');
        }

        return '<div class="ms-Dropdown" tabindex="0"> \
                    <i class="ms-Dropdown-caretDown ms-Icon ms-Icon--ChevronDown"></i> \
                    <select class="ms-Dropdown-select" id="' + cId + '">' + choices.join('') + '</select> \
                </div> \
                <div class="ms-MessageBar ms-MessageBar--error" style="display:none;" id="' + errMbId +'"> \
                    <div class="ms-MessageBar-content"> \
                        <div class="ms-MessageBar-text" id="' + errMbtId + '"></div> \
                    </div> \
                </div>';
    } else {
        var choices = [];
        for (var i = 0; i < formCtx.fieldSchema.Choices.length; ++i) {
            var value = formCtx.fieldSchema.Choices[i];

            choices.push('<li class="ms-RadioButton">');
            choices.push('<input tabindex="-1" type="radio" class="ms-RadioButton-input" data-control-value="' + value + '" name="' + cId + '" />');
            choices.push('<label role="radio" class="ms-RadioButton-field" tabindex="0" aria-checked="false" name="' + cId + '">');
            choices.push('<span class="ms-Label">' + value + '</span> ');
            choices.push('</label>');
            choices.push('</li>');
        }

        return '<div class="ms-ChoiceFieldGroup" id="' + cId + '" role="radiogroup"> \
                    <ul class="ms-ChoiceFieldGroup ms-ChoiceFieldGroup-list">' + choices.join('') + '</ul> \
                </div> \
                 <div class="ms-MessageBar ms-MessageBar--error" style="display:none;" id="' + errMbId +'"> \
                    <div class="ms-MessageBar-content"> \
                        <div class="ms-MessageBar-text" id="' + errMbtId + '"></div> \
                    </div> \
                </div>';
    }    
};

Atos.ChoiceGetValueCallback = function (controlId, formatType) {
    if (formatType == SPClientTemplates.ChoiceFormatType.Dropdown) {
        return document.getElementById(controlId).value;
    } else {
        var choices = document.getElementsByName(controlId);

        for(var i = 0; i < choices.length; i++) {
            if(choices[i].checked) {
                return choices[i].getAttribute('data-control-value');
            }
        } 
    }
};

/* Helpers */

Atos.AttachFabricEvents = function () {
    var CheckBoxElements = document.querySelectorAll(".ms-CheckBox");
    for (var i = 0; i < CheckBoxElements.length; i++) {
        new fabric['CheckBox'](CheckBoxElements[i]);
    }

    var TextFieldElements = document.querySelectorAll(".ms-TextField");
    for (var i = 0; i < TextFieldElements.length; i++) {
        new fabric['TextField'](TextFieldElements[i]);
    }

    var DropdownHTMLElements = document.querySelectorAll('.ms-Dropdown');
    for (var i = 0; i < DropdownHTMLElements.length; ++i) {
        var Dropdown = new fabric['Dropdown'](DropdownHTMLElements[i]);
    }

    var ChoiceFieldGroupElements = document.querySelectorAll(".ms-ChoiceFieldGroup");
    for (var i = 0; i < ChoiceFieldGroupElements.length; i++) {
        new fabric['ChoiceFieldGroup'](ChoiceFieldGroupElements[i]);
    }
};

Atos.ValidationErrorCallback = function (fieldTitle, errMbId, errMbtId, error) {
    if (error.validationError) {
        document.getElementById(errMbtId).innerText = error.errorMessage;
        document.getElementById(errMbId).style.display = "block";
    } else {
        document.getElementById(errMbId).style.display = "none";
    }
};

/* Execute start ups */

_spBodyOnLoadFunctionNames.push("Atos.AttachFabricEvents");

Atos.FormRenderSetup();