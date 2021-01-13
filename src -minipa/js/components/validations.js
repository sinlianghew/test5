import { extend } from "vee-validate";
import { required, min, max, integer, email, length } from "vee-validate/dist/rules";
import moment from 'moment';
import { extractDOB, getCardType, checkLuhn } from '../helpers/utilities';
const prefixMobile = $('input[name=prefixMobile]').val();
extend('required', {
    ...required,
    message: function (fieldName, placeholders) {
        return `* Complete the ${fieldName} field.`
    }
});

extend('min', min)
extend('max', max)
extend('integer', integer)
extend('email', email)
extend('length', length)

extend('mustBeTrue', {
    validate: function (value) {
        if (value !== true) {
            return false;
        }
        return true;
    }
})

extend('validName', {
    validate: function (value) {
        // Sample: Kelvin Lee @ Rogers A/L T'Challa
        if (value.length === 0) return true;
        const regex = /^[((a-zA-Z)*)(@)(/)(')(\s)(\-)]+$/g;
        return regex.test(value)
    }
})

extend('nricValidDob', {
    validate: function (value) {
        if (value.length === 0 || value.length < 4) return true;
        
        const thisYear = new Date().getFullYear();

        const month = parseInt(value.substr(2, 2));
        if (month > 12) return false;

        const day = parseInt(value.substr(4, 2));
        return moment(`${thisYear} ${month} ${day}`, 'YYYY MM DD').isValid();      
    }
})

extend('nonMalaysianMinAge', {
    validate: function (value) {
        if (value.length === 0) return true;
        console.log("nM value : "+value);
        var value1= value;
        if(value1 instanceof Date){
            // do nothing
        }
        else{
            //value1 = new Date(Date.parse(value1));
            value1 = moment(value1).toDate();
        }
        console.log("nM value1 : "+value1);
        const dob = value1.getFullYear();
        const thisYear = new Date().getFullYear();
        return (thisYear - dob >= 16) && (thisYear - dob <= 65);    
    }
})

extend('nricAge18AndAbove', {
    validate: function (value) {
        if (value.length === 0) return true;
        const today = new Date();
        const dob = extractDOB(value);
        return (today.getFullYear() - dob.getFullYear() >= 16) && (today.getFullYear() - dob.getFullYear() <= 65);
    }
})

extend('isPostcodeExist', {
    validate: async function (value) {

    }
})

extend('isCreditCardValid', {
    validate: function (value) {
        if (value.length === 0) return true;

        let cardNumber = value.replace(/\D/g, '');
        if (cardNumber.length < 16) return false;

        if (getCardType(cardNumber) === null) return false;

        if (!checkLuhn(cardNumber)) return false;

        return true;
    }
})

extend('isCreditCardExpiryValid', {
    validate: function (value) {
        if (value.length === 0) return true;

        const pattern = /[0-9]{2}\/[0-9]{2}/g;
        if (!pattern.test(value)) return false;

        const expiryDate = moment(value, 'MM/YY');
        if (!expiryDate.isValid()) return false;

        if (!expiryDate.isAfter(moment(), 'month')) return false;

        return true;
    }
})

extend('mobileNumber', {
    validate: function (value) {
        if (!value.length) return true;
       
        var oRegEx = new RegExp("^(" + prefixMobile + ")[-]{0,1}[0-9]{3}\\s[0-9]{4,7}$");
        return oRegEx.test(value);
    
        //const number = value.replace(/[\s-]*/g, '');
        //return /^\d*$/.test(number) && number.length <= 11 && number.length >= 10
    }
})

extend('validStartDate', {
    validate: function (value) {
        console.log("value: "+value)
        if (value.length === 0) return true;
        const today = new Date();
        const maxDate = new Date(today.getFullYear(), today.getMonth() + 6, today.getDate());
        var value1= value;
        if(value1 instanceof Date){
            // do nothing
        }
        else{
            //value1 = new Date(Date.parse(value1));
            value1 = moment(value1).toDate();
        }
        console.log("value1: "+value1)
        //const within60Days = (value.valueOf() - today.valueOf() <= 1000*60*60*24*60) ? true : false;
        return (value1 >= today) && (value1 <= maxDate);      
    }
})