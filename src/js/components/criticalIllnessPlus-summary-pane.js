export default {
    template: '#criticalIllnessPlus-summary-pane-template',
    props: ['formData', 'currStepNum'],
    //'showSpecialAddOns'
    data: function() {
        return {
            isExpanded: false,
        }
    },
    computed: {
        policyStartDate: function () { 
            let startD = new Date(this.formData['2'].coverageStartDate);
            startD =  new Date (startD.valueOf() );
            return String(startD.getDate()).padStart(2,'0') + "/" +String(startD.getMonth()+1).padStart(2,'0') + "/"+ String(startD.getFullYear()) ;           
            
        },
        policyEndDate: function () { 
            let endD = new Date(this.formData['2'].coverageStartDate);
            endD =  new Date (endD.valueOf() + 1000*60*60*24*364);
            return String(endD.getDate()).padStart(2,'0') + "/" +String(endD.getMonth()+1).padStart(2,'0') + "/"+ String(endD.getFullYear());           
            
        },
    },
    methods: {
        formatAsCurrency: function(number) {
            if (typeof number === 'undefined' || typeof number === 'object') {
                number = 0;
            }
            return number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        },
        formatAsNonDecimal: function(number) {
            return parseFloat(number).toFixed(0);
        },
        toggleExpand: function() {
            this.isExpanded = !this.isExpanded;
        }
    }
}