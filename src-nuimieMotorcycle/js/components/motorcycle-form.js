//before build 

//comment for local test
//uncomment for local test


import Vue from 'vue';
import $ from 'jquery';
import _, { isNull, toPlainObject } from 'lodash';
import { mask, masked } from 'vue-the-mask';
import moment from 'moment';
import VueTypeaheadBootstrap from 'vue-typeahead-bootstrap/dist/VueBootstrapTypeahead.common';
import { ValidationProvider, ValidationObserver } from 'vee-validate'
import { extractDOB, createDotCMSQueryURL, getCardType, scrollTo, getInputValueOrEmpty } from '../helpers/utilities';
import MotorcycleSummaryPane from './motorcycle-summary-pane';
import Datepicker from 'vuejs-datepicker';
Vue.component('motor-summary-pane', MotorcycleSummaryPane)

/**
 * Staff Relation: ['Direct Relationship']
 */

const m3paform = new Vue({
    el: '#motorcycle-form',
    data: {
        stage: getInputValueOrEmpty("stage"),
        isInIframe: getInputValueOrEmpty("isInIframe"),
        baseUrl: getInputValueOrEmpty("tieBaseUrl"),
        productCode: getInputValueOrEmpty("productCode"),
        partnerCode: getInputValueOrEmpty("partnerCode"),
        prefixMobile: getInputValueOrEmpty("prefixMobile"),
        productName: getInputValueOrEmpty("productName"),
        productGroup: getInputValueOrEmpty("productGroup"),
        branchCode: getInputValueOrEmpty("branchCode"),
        staffId: getInputValueOrEmpty("staffId"),
        staffRelationship: getInputValueOrEmpty("staffRelationship"),
        supportTel: getInputValueOrEmpty("supportTel"),
        supportTelLabel: getInputValueOrEmpty("supportTelLabel"),
        thankYouPageUrl: getInputValueOrEmpty("thankYouPageUrl"),
        formula: getInputValueOrEmpty("formula"),
        registrationUrl: getInputValueOrEmpty("registrationUrl"),
        paymentUrl: getInputValueOrEmpty("paymentUrl"),
        summaryUrl: getInputValueOrEmpty("summaryUrl"),
        certificateNo: getInputValueOrEmpty("certificateNo"),
        productMinAge: getInputValueOrEmpty("productMinAge"),
        productMinAgeUnit: getInputValueOrEmpty("productMinAgeUnit"),
        productMaxAge: getInputValueOrEmpty("productMaxAge"),
        productMaxAgeUnit: getInputValueOrEmpty("productMaxAgeUnit"),
        maxCoverDuration: getInputValueOrEmpty("maxCoverDuration"),
        maxCoverDurationUnit: getInputValueOrEmpty("maxCoverDurationUnit"),
        coveragePlan: getInputValueOrEmpty("coveragePlan"),
        coveragePremiumRate: getInputValueOrEmpty("coveragePremiumRate"),
        coveragePremiumUpgradeRate: getInputValueOrEmpty("coveragePremiumUpgradeRate"),
        coveragePremiumType: getInputValueOrEmpty("coveragePremiumType"),
        commissionRate: getInputValueOrEmpty("commissionRate"),
        partnerName: getInputValueOrEmpty("partnerName"),
        productDisclosurePDFUri: getInputValueOrEmpty("productDisclosurePDFUri"),
        isFpxPaymentGateway: getInputValueOrEmpty("isFpxPaymentGateway"),
        isBoostPaymentGateway: getInputValueOrEmpty("isBoostPaymentGateway"),
        modelInvalidButAllowed: getInputValueOrEmpty("modelInvalidButAllowed"),
        originalModelIsInvalid: getInputValueOrEmpty("originalModelIsInvalid"),
        originalModelFromNcd: getInputValueOrEmpty("originalModelFromNcd"),
        emailUs: getInputValueOrEmpty("emailUs"),
        partnerUrlTitle: getInputValueOrEmpty("partnerUrlTitle"),

        wishToRestoreSession: false,
        staffIDInvalid: false,
        // wj - staff relationship
        staffRelationshipInvalid: false,
        staffSelectFirstTime: false,
        staffSelectStatus: false,
        // wj - staff relationship end

        steps: [{
            stepNum: '1',
            title: 'Get Started',
            completed: false,
            showStaffVerification: getInputValueOrEmpty("partnerCode") === 'msigstaff' ? true : false,
            // wj - staff relationship
            hasStaffBefore: getInputValueOrEmpty("partnerCode") === 'msigstaff' ? true : false,
            staffRelationshipSelect: false,
            // wj - staff relationship end
            showPrescreen: true,
            hash: 'prescreen'
        },
        { stepNum: '2', title: 'Fill In Details', completed: false, hash: 'fillindetails' },
        { stepNum: '3', title: 'Plan Selection', completed: false, hash: 'planselection' },
        { stepNum: '4', title: 'REVIEW', completed: false, hash: '' },
        { stepNum: '5', title: 'PAY', completed: false, hash: '' }
        ],
        currStep: null,

        loading: false, // this controls the spinner
        canProceed: true,
        errorMessage: null,

        // Data pulled in from dotCMS on pageload
        countries: null,
        states: null,
        banks: null,
        // wj - staff relationship
        staff_relations: null,
        // wj - max-cc
        maxCCData: 0,

        // Data used by the auto complete
        postcodeSearch: '',
        postcodeSuggestions: [],
        currSelectedPostcode: '',
        loanProviderSuggestions: [],
        occupationSuggestions: [],
        currSelectedOccupation: '',
        isNotKnownOccupation: false,
        isNotKnownPostcode: false,

        // Data used for motorcycle information
        allMake: [],
        allModelsByMake: [],
        allModelVariants: [],
        allCcVariants: [],
        filterAllCC: [],

        //test commit
        formData: {
            1: {
                policyHolderIdType: 'nric',
                country: '',
                policyHolderNric: '',
                motorRegistrationNo: '',
                agreement: false
            },
            2: {
                motorVehicleLocation: '', // a.k.a. vpmsStateCode, it's inside an object
                curMktValue: 0,
                motorLoanProvider: '',
                policyHolderName: '',
                policyHolderEmail: '',
                policyHolderMobileNo: '',
                policyHolderAddressLine1: '',
                policyHolderAddressLine2: '',
                policyHolderGender: '', // remember to use computed property instead
                policyHolderDateOfBirth: '',
                addressPostcode: '',
                addressState: '',
                addressStateCode: '',
                addressCity: '',
                policyHolderMaritalStatus: '',
                policyHolderOccupation: '',
                sumInsuredType: '',
                motorMakeDescription: '',
                policyHolderOccupationItemCode: '',

                // wj - membership id
                membershipID: '',
                modelAndFamily: '',
                originalModel99: '',
            },
            3: {
                motorPlanType: 'comprehensive',
                motorPlusPlan: 'Y', // consider removing
                motorAddRiderPA: '',
                motorAddLegalLiabilityToPassengers: '',
                motorAddLegalLiabilityOfPassengers: '',
                motorAddLegalLiabilityToPillion: '',
                motorAddSpecialPerils: '',
                motorAddSRCC: '',
                allRiderPlan: true,
            },
            4: {
                tncAgreement: false,
                commissionAgreement: false,
                isMotorDetailsEditMode: false,
                isRiderDetailsEditMode: false,
                purchaseTempId: '',

                // Motorcycle Details Edit
                motorVehicleLocation: '',

                // Rider Details Edit
                policyHolderName: '',
                policyHolderEmail: '',
                policyHolderMobileNo: '',
                policyHolderAddressLine1: '',
                policyHolderAddressLine2: '',
                addressPostcode: '',
                addressState: '',
                addressStateCode: '',
                addressCity: '',
                policyHolderMaritalStatus: '',
                policyHolderOccupation: '',
                policyHolderOccupationItemCode: '',

                // wj - membership id
                membershipID: '',
                staffId: '',
                staffRelationship: '',

            },
            5: {
                paymentMethod: 'fpxPaymentGateway',
                bankId: '',
                fpxEmail: '',
                cardHolderName: '',
                ccNo: '',
                expiry: '',
                cvv: '',
                ewalletVendor: null
            }
        },

        copyOfNricOrPassport: null,
        copyOfVehicleRegNum: null,

        underwrittenRules: {},
        hexTokens: {
            F: {
                pattern: /[0-9A-Za-z]/,
                transform: v => v.toLocaleUpperCase()
            }
        },

        openDate: moment().subtract(16, "years").toDate(),
        disabledDates: {
            from: moment().subtract(16, "years").toDate(),
            to: moment().subtract(75, "years").toDate()
        },

        checkTime: true,

    },
    components: {
        ValidationProvider,
        ValidationObserver,
        VueTypeaheadBootstrap,
        Datepicker
    },
    directives: {
        mask,
        masked
    },
    // wj - motorcycle model 99
    // Life cycle hooks
    updated() {
        if (this.currStep.stepNum == '5') return;

        var motorModelInput = $("#motorModelInput");
        // Check if model input exist
        if (motorModelInput.length > 0) {
            //var motorModelCode = this.formData['2'].motorModel.modelCode;
            // Check if motor model matches condition
            // Change if neccessary
            if (this.originalModelIsInvalid === true) {
                $("#motorModelSelect").removeAttr("disabled");
                $("#motorModelSelect").addClass("is-invalid");
                $("#motorModelSelect").attr("required");
            } else {
                $("#motorModelError").css("display", "none");
            }
        }
        if (this.originalModelIsInvalid === true) {
            this.modelFilter(this.formData['2'].motorMakeCode, this.formData['2'].motorYearOfMake, this.formData['2'].motorModel, this.formData['2'].motorModelCode, "Y");
            if (this.formData['2'].motorModel != null) {
                this.updateCcVariant(this.formData['2'].motorModel.modelCode + '|' + this.formData['2'].family);
            }
        }
    },
    // wj - motorcycle model 99 END
    methods: {
        setInputFilter(textbox, inputFilter) {
            ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function (event) {
                textbox.addEventListener(event, function () {
                    if (inputFilter(this.value)) {
                        this.oldValue = this.value;
                        this.oldSelectionStart = this.selectionStart;
                        this.oldSelectionEnd = this.selectionEnd;
                    } else if (this.hasOwnProperty("oldValue")) {
                        this.value = this.oldValue;
                        this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
                    } else {
                        this.value = "";
                    }
                });
            });
        },
        // wj - date of birth format
        format_date(value) {
            if (value) {
                return moment(String(value)).format('DD/MM/YYYY')
            }
        },
        // wj - motorcycle model 99
        motorSelection: function (event) {
            if (event.target.value != null) {
                $("#motorModelInput").val(event.target.value);
                $("#motorModelSelect").removeClass("is-invalid");
                $("#motorModelError").css("display", "none");
                $("#motorcycleLocation").prop("disabled", true);
            }
        },
        filter: function (event) {
            if (this.formData['2'].motorModel != null) {
                this.modelFilter(this.formData['2'].motorModel.makeCode, this.formData['2'].motorModel.year, this.formData['2'].motorModel, this.formData['2'].motorModelCode, "N");
            } else {
                this.modelFilter(this.formData['2'].motorMakeCode, this.formData['2'].motorYearOfMake, this.formData['2'].motorModel, this.formData['2'].motorModelCode, "N");
            }
        },
        updateCcVariant: async function (event) {
            var tempValue = '';
            if (event.target != null) {
                tempValue = event.target.value;
                $("#motorcycleLocation").prop("disabled", false);
            }
            else if (event != null) {
                tempValue = event;
            }
            if (tempValue != null) {
                var splitEvent = tempValue.split("|");
                var splitCode = splitEvent[0]; //modelcode
                var splitName = splitEvent[1];  //modelname

                this.allCcVariants = await this.findMotorcycleCCVariants(this.formData['2'].motorMakeCode, splitCode, this.formData['2'].motorYearOfMake, this.formData['2'].nxtNCDEffDt)
                if (this.allCcVariants != null) {
                    this.formData['2'].motorCc = this.allCcVariants[0];
                }
                this.allModelVariants = await this.findMotorcycleModelVariants(this.formData['2'].motorMakeCode, splitCode, this.formData['2'].motorYearOfMake, this.formData['2'].motorCc, this.formData['2'].nxtNCDEffDt)
                if (this.allModelVariants != null) {
                    this.formData['2'].motorModel = this.allModelVariants[0];
                }

                this.formData['2'].motorModel.family = splitName;
                this.formData['2'].family = splitName;
                this.formData['2'].motorModel.modelCode = splitCode;

                this.getUpdateCcVariant(this.formData['2'].motorModel.makeCode,
                    this.formData['2'].motorModel.modelCode,
                    this.formData['2'].motorModel.year,
                    this.formData['2'].nxtNCDEffDt
                )

                if (this.formData['2'].motorModel != null) {
                    this.findMotorcycleModelVariants(this.formData['2'].motorModel.makeCode,
                        this.formData['2'].motorModel.modelCode,
                        this.formData['2'].motorModel.year,
                        this.formData['2'].motorCc,
                        this.formData['2'].nxtNCDEffDt
                    )
                }

                this.handleMotorModelChanged()
                this.formData['2'].modelAndFamily = this.formData['2'].motorModel.modelCode + '|' + this.formData['2'].family;
                console.log(this.formData['2'].modelAndFamily);
                console.log(this.formData['2'].motorModel.modelCode + '|' + this.formData['2'].family);
            }
        },
        // wj - motorcycle model 99 END
        createDotCMSQueryURL,
        findCountryByCode(code) {
            if (!this.countries) return ''
            return this.countries.find(c => c.code === code)
        },
        async verifyStaffID() {
            this.staffIDInvalid = false;

            const isValid = await this.$refs.form.validate()
            if (!isValid) return;

            let apiUrl = this.baseUrl + '/dotCMS/purchase/buynow';
            const results = await $.ajax({
                method: 'POST',
                url: apiUrl,
                data: {
                    action: 'staffIdCheck',
                    partnerCode: this.partnerCode,
                    staffId: this.staffId
                }
            })

            // wj - staff id
            var resultsJSON = JSON.parse(results);

            if (resultsJSON.hasOwnProperty('canProceed')) {
                // original code
                // if (!results.canProceed) {
                if (!resultsJSON.canProceed) {
                    this.staffIDInvalid = true;
                    return
                }
            }
            this.steps[0].showStaffVerification = false;
        },
        // wj - staff relationship
        verifyStaffRelationship() {
            let hasRelationship = true;
            if (this.staffRelationship) {
                this.staffRelationshipInvalid = false;
                this.steps[0].staffRelationshipSelect = true;
                hasRelationship = false;
            } else {
                this.staffRelationshipInvalid = true;
            }
            return hasRelationship;
        },
        staffRelationshipBack() {
            this.steps[0].showStaffVerification = true;
            this.steps[0].staffRelationshipSelect = false;
        },
        staffRelationshipChange() {
            if (this.staffRelationship != null) {

                this.staffRelationshipInvalid = false;
            } else {
                if (this.staffSelectFirstTime == false) {
                    this.staffRelationshipInvalid = true;
                }
            }

            if (this.staffSelectFirstTime == false) {
                this.staffSelectFirstTime == true;
            }

        },
        backToRelationship() {
            console.log(this.staffId + " | " + this.staffRelationship)
            this.steps[0].showStaffVerification = false;
            this.steps[0].staffRelationshipSelect = false;
        },
        // wj - staff relationship end
        saveSession() {
            const state = {
                allMake: this.allMake,
                allModelsByMake: this.allModelsByMake,
                allModelVariants: this.allModelVariants,
                allCcVariants: this.allCcVariants,
                canProceed: this.canProceed,
                steps: this.steps,
                currStep: this.currStep,
                formData: this.formData,
                postcodeSearch: this.postcodeSearch,
                postcodeSuggestions: this.postcodeSuggestions,
                currSelectedPostcode: this.currSelectedPostcode,
                loanProviderSuggestions: this.loanProviderSuggestions,
                occupationSuggestions: this.occupationSuggestions,
                currSelectedOccupation: this.currSelectedOccupation,

            }
            window.sessionStorage.setItem('m3pa_data', JSON.stringify(state))
        },
        async maybeRestoreSession() {
            // window.sessionStorage.removeItem('m3pa_data')
            const state = JSON.parse(window.sessionStorage.getItem('m3pa_data'))

            if (this.stage !== 'registration' && !state) return this.canProceed = false;
            if (state && !state.canProceed) {
                return this.canProceed = false

            } else {
                let activeStep
                if (state) {
                    activeStep = this.getActiveStep(state.steps);
                }
                if (activeStep) {
                    const prevStep = state.steps.find(s => parseInt(activeStep.stepNum) - 1 === parseInt(s.stepNum))
                    if (prevStep && prevStep.completed) {
                        this.allMake = state.allMake;
                        this.allModelsByMake = state.allModelsByMake;
                        this.allModelVariants = state.allModelVariants;
                        this.allCcVariants = state.allCcVariants;
                        this.canProceed = state.canProceed;
                        this.steps = state.steps;
                        this.currStep = activeStep;
                        this.formData = state.formData;
                        this.postcodeSearch = state.postcodeSearch;
                        this.postcodeSuggestions = state.postcodeSuggestions;
                        this.currSelectedPostcode = state.currSelectedPostcode;
                        this.loanProviderSuggestions = state.loanProviderSuggestions;
                        this.occupationSuggestions = state.occupationSuggestions;
                        this.currSelectedOccupation = state.currSelectedOccupation;
                        this.$nextTick(() => this.rowMatchHeight())
                        return;
                    }
                }
            }

            this.currStep = this.steps[0]
            window.location.hash = this.currStep.hash;
            sessionStorage.removeItem('m3pa_data')
        },
        getActiveStep(steps) {
            const hash = window.location.hash.replace('#', '');
            const stage = this.stage;

            if (hash && stage === 'registration') {
                return steps.find(s => s.hash === hash)
            } else {
                switch (stage) {
                    case 'summary':
                        return steps.find(s => s.stepNum === '4')
                    case 'payment':
                        return steps.find(s => s.stepNum === '5')
                }
            }
        },
        setPrescreen: function (value) {
            this.steps[0].showPrescreen = value;
        },
        scrollTop() {
            return new Promise((resolve, reject) => {
                const offset = $("#motorcycle-form").offset().top;
                if (window.scrollY < 100) {
                    return resolve()
                }
                scrollTo(offset).then(() => resolve())
            })
        },
        resetForm: function () {
            this.steps
                .filter(step => !['1'].includes(step.stepNum))
                .forEach(step => step.completed = false)

            this.postcodeSearch = '';
            this.postcodeSuggestions = [];
            this.currSelectedPostcode = '';
            this.loanProviderSuggestions = [];
            this.occupationSuggestions = [];
            this.currSelectedOccupation = '';
            this.isNotKnownOccupation = false;
            this.isNotKnownPostcode = false;

            this.formData['2'] = {
                motorVehicleLocation: '', // a.k.a. vpmsStateCode, it's inside an object
                curMktValue: 0,
                motorLoanProvider: '',
                policyHolderName: '',
                policyHolderEmail: '',
                policyHolderMobileNo: '',
                policyHolderAddressLine1: '',
                policyHolderAddressLine2: '',
                policyHolderGender: '', // remember to use computed property instead
                policyHolderDateOfBirth: '',
                addressPostcode: '',
                addressState: '',
                addressStateCode: '',
                addressCity: '',
                policyHolderMaritalStatus: '',
                policyHolderOccupation: '',
                policyHolderOccupationItemCode: '',
                sumInsuredType: '',

                // wj - membership id
                membershipID: '',
                staffId: '',
                staffRelationship: '',
            }

            this.formData['3'] = {
                motorPlanType: 'comprehensive',
                motorPlusPlan: 'Y', // consider removing
                motorAddRiderPA: '',
                motorAddLegalLiabilityToPassengers: '',
                motorAddLegalLiabilityOfPassengers: '',
                motorAddLegalLiabilityToPillion: '',
                motorAddSpecialPerils: '',
                motorAddSRCC: '',
                allRiderPlan: true,
            }

            this.formData['4'] = {
                tncAgreement: false,
                commissionAgreement: false,
                isMotorDetailsEditMode: false,
                isRiderDetailsEditMode: false,
                purchaseTempId: '',

                // Motorcycle Details Edit
                motorVehicleLocation: '',

                // Rider Details Edit
                policyHolderName: '',
                policyHolderEmail: '',
                policyHolderMobileNo: '',
                policyHolderAddressLine1: '',
                policyHolderAddressLine2: '',
                addressPostcode: '',
                addressState: '',
                addressStateCode: '',
                addressCity: '',
                policyHolderMaritalStatus: '',
                policyHolderOccupation: '',
                policyHolderOccupationItemCode: '',


                // wj - membership id
                membershipID: '',
                staffId: '',
                staffRelationship: '',
            }

            // wj - FPX hide
            if (this.isFpxPaymentGateway === 'false') {
                this.formData['5'] = {
                    // wj - mpgs : original - abmbPaymentGateway
                    paymentMethod: 'msigCentralizedMastercardPaymentGateway',
                    bankId: '',
                    fpxEmail: '',
                    cardHolderName: '',
                    ccNo: '',
                    expiry: '',
                    cvv: '',
                    ewalletVendor: null,
                }
            } else {
                this.formData['5'] = {
                    paymentMethod: 'fpxPaymentGateway',
                    bankId: '',
                    fpxEmail: '',
                    cardHolderName: '',
                    ccNo: '',
                    expiry: '',
                    cvv: '',
                    ewalletVendor: null,
                }
            }
            // wj - FPX hide end

            this.saveSession()
        },
        onSubmit: async function () {
            this.loading = true;

            if (this.currStep.stepNum == '1') {

                const isBlacklisted = (await this.checkBlacklist()).isBlacklisted;
                if (isBlacklisted) {
                    this.errorMessage = "Sorry, we are unable to proceed with your application.";
                    this.canProceed = false;
                    return;
                }

                if (this.copyOfVehicleRegNum !== this.formData['1'].motorRegistrationNo &&
                    this.copyOfNricOrPassport !== this.formData['1'].policyHolderNric) {
                    console.log('user change their detail');
                    this.resetForm();
                }

                // Check the vehicle's NCD
                const motorDetails = await this.checkNCD()
                this.formData['2'] = {
                    ...this.formData['2'],
                    ...motorDetails
                }

                /** Comment the section below out when doing development in production */
                if (!motorDetails.canProceed) {
                    if (motorDetails.errorCode) {
                        let errorMessage = await this.findErrorByErrorCodeAsync(motorDetails.errorCode)
                        let $errorMessage = $('<p>' + errorMessage + '</p>')
                        $errorMessage.find('a').attr('href', 'tel:' + this.supportTel).html(this.supportTelLabel)
                        this.errorMessage = $errorMessage.html();
                    }
                    this.canProceed = false;
                    window.killUnloadM3PA && window.killUnloadM3PA()
                    return;
                }

                // Don't take the Cubic Capacity from here, it is not valid
                const { motorMakeCode, motorModelCode, motorYearOfMake, nxtNCDEffDt } = motorDetails;
                this.originalModelFromNcd = motorModelCode;
                var modelsAllowed = this.modelInvalidButAllowed.split("|");
                for (var i = 0; i < modelsAllowed.length; i++) {
                    console.log("modelsAllowed[" + i + "]: " + modelsAllowed[i]);
                    console.log("motorModelCode: " + this.originalModelFromNcd);
                    if (modelsAllowed[i] === this.originalModelFromNcd) {
                        this.originalModelIsInvalid = true;
                        this.formData['2'].originalModel99 = 'Y';
                    }
                }

                this.formData['2'].motorMakeDescription = await this.findMotorMake(motorMakeCode, this.productCode)

                this.allModelsByMake = await this.findAllMotorMakeVehicleModels(motorMakeCode)

                if (this.allModelsByMake != null) {
                    this.formData['2'].motorMakeCode = this.allModelsByMake[0].makeCode;
                    if (this.originalModelIsInvalid === true) {
                        this.modelFilter(this.formData['2'].motorMakeCode, this.formData['2'].motorYearOfMake, this.formData['2'].motorModel, this.formData['2'].motorModelCode, "Y");
                    }
                }

                this.allCcVariants = await this.findMotorcycleCCVariants(motorMakeCode, motorModelCode, motorYearOfMake, nxtNCDEffDt)
                if (this.allCcVariants != null) {
                    this.formData['2'].motorCc = this.allCcVariants[0];
                }
                this.allModelVariants = await this.findMotorcycleModelVariants(motorMakeCode, motorModelCode, motorYearOfMake, this.formData['2'].motorCc, nxtNCDEffDt)
                if (this.allModelVariants != null) {
                    this.formData['2'].motorModel = this.allModelVariants[0];
                }


                // By right not supposed to set like this..
                this.handleMotorModelChanged()
            } else if (this.currStep.stepNum == '2') {
                await this.calculatePremiumAsync()
            } else if (this.currStep.stepNum == '3') {
                if (this.formData['3'].motorPlusPlan === null) {
                    $('#information-modal .content-container').html(
                        `<p>You have not selected a plan yet</p>`
                    )
                    this.loading = false;
                    $('#information-modal').modal('show')
                    $('#information-modal').one('hidden.bs.modal', () => {
                        let position = $('.motorcycle-selection').offset().top - 10;
                        this.scrollToPosition(position, 800)
                    })
                    return;
                }

                // Copy the values over. This is needed for the cancel functionality
                this.formData['4'].motorVehicleLocation = this.formData['2'].motorVehicleLocation;
                this.formData['4'].policyHolderName = this.formData['2'].policyHolderName;
                this.formData['4'].policyHolderEmail = this.formData['2'].policyHolderEmail;
                this.formData['4'].policyHolderMobileNo = this.formData['2'].policyHolderMobileNo;
                this.formData['4'].policyHolderAddressLine1 = this.formData['2'].policyHolderAddressLine1;
                this.formData['4'].policyHolderAddressLine2 = this.formData['2'].policyHolderAddressLine2;
                this.formData['4'].addressPostcode = this.formData['2'].addressPostcode;
                this.formData['4'].addressState = this.formData['2'].addressState;
                this.formData['4'].addressStateCode = this.formData['2'].addressStateCode;
                this.formData['4'].addressCity = this.formData['2'].addressCity;
                this.formData['4'].policyHolderMaritalStatus = this.formData['2'].policyHolderMaritalStatus;
                this.formData['4'].policyHolderOccupation = this.formData['2'].policyHolderOccupation;
                this.formData['4'].policyHolderOccupationItemCode = this.formData['2'].policyHolderOccupationItemCode;
                this.formData['4'].memberOccupation = this.formData['2'].memberOccupation;
                this.formData['4'].memberOccupationItemCode = this.formData['2'].memberOccupationItemCode;

                // wj - membership ID
                this.formData['4'].membershipID = this.formData['2'].membershipID;
                this.formData['4'].staffId = this.staffId;
                this.formData['4'].staffRelationship = this.staffRelationship;

                window.killUnloadM3PA && window.killUnloadM3PA()
                this.currStep.completed = true;
                this.saveSession();
                this.processPurchaseStep1()
                await this.scrollTop();
                return;

            } else if (this.currStep.stepNum == '4') {
                const response = await this.initiatePayment()
                const $errorFormWrapper = $(`<div id="error-form-wrapper">${response}</div>`)
                $errorFormWrapper.find('form').attr('action', this.paymentUrl)
                $(this.$el).find('#error-form-placeholder').html($errorFormWrapper.html());
                this.formData['4'].purchaseTempId = $errorFormWrapper.find('input[name="purchaseTempId"]').val()

                window.killUnloadM3PA && window.killUnloadM3PA()
                this.currStep.completed = true;
                this.saveSession();
                await this.scrollTop();
                $(this.$el).find('#error-form-placeholder form').trigger('submit')
                return;
            } else if (this.currStep.stepNum == '5') {
                window.killUnloadM3PA && window.killUnloadM3PA()
                $('form#thePaymentForm').trigger('submit');
                this.saveSession()
                return
            }

            await this.scrollTop();

            this.currStep.completed = true;
            this.currStep = this.steps[this.steps.indexOf(this.currStep) + 1];
            window.location.hash = this.currStep.hash;

            this.loading = false;
            this.initializeTooltips()
            this.$nextTick(() => this.rowMatchHeight())
            this.saveSession()
        },
        goToPrevStep: async function () {
            if (this.steps.indexOf(this.currStep) == 0) {
                return;
            }

            this.loading = true;

            if (this.currStep.stepNum == '2') {
                // User is trying to go back to step 1, so let's make a copy of the car number and IC
                // This is used to check if the user has changed their nric or reg no
                this.copyOfNricOrPassport = this.formData['1'].policyHolderNric;
                this.copyOfVehicleRegNum = this.formData['1'].motorRegistrationNo;
            }

            if (this.currStep.stepNum == '4' && !['registration', 'payment'].includes(this.stage)) {
                await this.scrollTop();
                window.killUnloadM3PA && window.killUnloadM3PA()
                this.saveSession();
                window.location.href = this.registrationUrl + '#planselection';
                // this.currStep = this.steps[this.steps.indexOf(this.currStep) - 1];
                return;
            }

            if (this.currStep.stepNum == '5' && !['registration', 'summary'].includes(this.stage)) {
                await this.scrollTop();
                window.killUnloadM3PA && window.killUnloadM3PA()
                this.saveSession();
                window.location.href = this.summaryUrl;
                // this.currStep = this.steps[this.steps.indexOf(this.currStep) - 1];
                return;
            }

            this.saveSession()
            await this.scrollTop();
            this.currStep = this.steps[this.steps.indexOf(this.currStep) - 1];
            window.location.hash = this.currStep.hash;
            this.initializeTooltips()
            this.loading = false;
            this.$nextTick(() => this.rowMatchHeight())
        },
        checkNCD: async function () {
            let apiUrl = this.baseUrl + '/dotCMS/purchase/buynow';

            return $.ajax({
                method: 'POST',
                url: apiUrl,
                data: {
                    action: 'motorNcdCheck',
                    motorRegistrationNo: this.formData['1'].motorRegistrationNo,
                    motorChassisNo: '',
                    partnerCode: this.partnerCode,
                    productCode: this.productCode,
                    productName: this.productName,
                    policyHolderNRIC: this.formData['1'].policyHolderNric
                },
                dataType: 'json'
            }).promise()
        },
        /**
         * Returns a list of models produced by a make (e.g. Yamaha).
         * @param {string} motorMakeCode 
         */
        // (jw) to set a condition for only valid model - motorcycle 99  

        modelFilter(motorMakeCode, motorYearOfMake, hasMotorModel, hasMotorModelCode, defaultSelection) {
            var ram = this;
            let maximumCC = this.maxCCData;
            return $.ajax({
                method: 'GET',
                url: '/api/content/render/false/type/json/limit/0/query/+structureName:TieBancaIsmAbiDataStructure%20+(conhost:ceaa0d75-448c-4885-a628-7f0c35d374bd%20conhost:SYSTEM_HOST)%20+TieBancaIsmAbiDataStructure.year:' + motorYearOfMake + '%20+TieBancaIsmAbiDataStructure.makeCode:' + motorMakeCode + '+%20+languageId:1%20+live:true/orderby/score,modDate%20desc',
                dataType: 'json',
                success: function (data) {
                    if (data !== null && data.contentlets.length > 0) {
                        for (var i = 0; i < data.contentlets.length; i++) {
                            // wj - max-cc
                            if (data.contentlets[i].cc < maximumCC) {
                                $('option[name=' + data.contentlets[i].modelCode + ']').show();
                                // wj - Store the correct mode codes into a separate array, filterAllCC
                                ram.filterAllCC.splice(0, 0, data.contentlets[i].modelCode);
                            }
                        }

                        // wj - To check if match
                        var matchModel = 0;
                        for (var i = 0; i < ram.allModelsByMake.length; i++) {
                            matchModel = 0
                            for (var j = 0; j < ram.filterAllCC.length; j++) {
                                // wj - If matching model code, add 1
                                if (ram.allModelsByMake[i].modelCode == ram.filterAllCC[j]) {
                                    matchModel = 1;
                                }
                            }
                            // wj - If no matching model, remove <option> with name = model code
                            if (matchModel != 1) {
                                var optionModel = ram.allModelsByMake[i].modelCode;
                                var optionName = document.getElementsByName(optionModel);
                                if (optionName.length > 0) {
                                    for (var k = 0; k < optionName.length; k++) {
                                        // wj - Remove the option
                                        optionName[k].parentNode.removeChild(optionName[k]);
                                    }
                                }
                            }
                        }
                    }
                    if (hasMotorModel == null && defaultSelection == "Y") {
                        $("#motorModelSelect").val("0");
                        $("select[name=motorVariant]").val("0").trigger("change");
                        $("select[name=motorCc]").val("0").trigger("change");
                    }
                },
                error: function (error) {
                    console.log("modelFilter error");
                }
            });


        },
        // wj - max-cc
        async getMaxCCData() {
            var maximumCC;
            const dataCC = await $.ajax({
                method: 'GET',
                //url: '/api/content/render/false/query/-contentType:forms%20+contentType:TieProductExtendedStructure%20+(conhost:ceaa0d75-448c-4885-a628-7f0c35d374bd%20conhost:SYSTEM_HOST)%20+(TieProductExtendedStructure.productCode:*MCY*%20TieProductExtendedStructure.productCode_dotraw:*MCY*)%20+languageId:1%20+deleted:false%20+working:true/orderby/score,modDate%20desc',
                url: '/api/content/render/false/query/-contentType:forms%20+contentType:TieProductExtendedStructure%20+(conhost:ceaa0d75-448c-4885-a628-7f0c35d374bd%20conhost:SYSTEM_HOST)%20+(TieProductExtendedStructure.productCode:*' + this.productCode + '*%20TieProductExtendedStructure.productCode_dotraw:*' + this.productCode + '*)%20+languageId:1%20+deleted:false%20+working:true/orderby/score,modDate%20desc',
                dataType: 'json',
                success: function (data) {
                    for (var i = 0; i < data.contentlets.length; i++) {
                        var uwr = data.contentlets[i].underwritingRules;
                        var splitUWRmax = uwr.split('"max-cc": ')
                        var splitUWRmin = splitUWRmax[1].split(', "min-si":');
                        var maxCC = splitUWRmin[0];
                        maximumCC = maxCC;
                    }
                },
                error: function (error) {
                    console.log("get maxx cc data error");
                }
            }).promise();
            return maximumCC;
        },
        // wj - max-cc end
        // for motor make
        async findMotorMake(makeCode, productCode) {
            const queryObj = {
                makeCode,
                productCode
            }
            const dotCMSQueryURL = this.createDotCMSQueryURL('TieRefBancaMotorMake', queryObj, true)
            const apiResp = await $.ajax({
                method: 'GET',
                dataType: 'json',
                url: dotCMSQueryURL
            })
            if (apiResp != null && apiResp.contentlets.length > 0) {
                for (var i = 0; i < apiResp.contentlets.length; i++) {
                    if (!apiResp.contentlets[i].makeDescription.includes('BOON SIEW'))
                        return apiResp.contentlets[i].makeDescription;
                }
            } else {
                return null;
            }

        },

        getUpdateCcVariant(motorMakeCode, motorModelCode, motorYearOfMake, coverageStartDate) {
            $('select[name=motorCc]').val("");
            $('select[name=motorCc]>option').remove();

            // this.allCcVariants = null;
            let apiUrl = this.baseUrl + '/dotCMS/purchase/buynow';
            let maximumCC = this.maxCCData;
            return $.ajax({
                method: 'POST',
                url: apiUrl,
                data: {
                    action: 'findCarCc',
                    motorMakeCode,
                    motorModelCode,
                    motorYearOfMake,
                    coverageStartDate
                },
                dataType: 'json',
                success: function (data) {
                    if (data !== null && data.length > 0) {
                        for (var i = 0; i < data.length; i++) {
                            // wj - max-cc
                            if (data[i] < maximumCC) {
                                var opt = $('<option/>', {
                                    "value": data[i],
                                });
                                opt.html(data[i]);
                                opt.appendTo($('select[name=motorCc]'));
                            }

                        }
                        $('select[name=motorVariant').prop("disabled", false);
                    }
                    else {
                        $('select[name=motorVariant').prop("disabled", true);
                        console.log("Invalid model");
                    }
                },
                error: function (error) {
                    console.log("error");
                }

            }).promise()
        },

        findAllMotorMakeVehicleModels(motorMakeCode) {
            let apiUrl = this.baseUrl + '/dotCMS/purchase/buynow';
            return $.ajax({
                method: 'POST',
                url: apiUrl,
                data: {
                    action: 'findCarModel',
                    motorMakeCode,
                    productCode: this.productCode
                },
                dataType: 'json'
            }).promise()
        },
        /**
         * Returns a list of cubic capacity for a particular model.
         * @param {string} motorMakeCode 
         * @param {string} motorModelCode 
         * @param {string} motorYearOfMake 
         * @param {string} coverageStartDate 
         */
        findMotorcycleCCVariants(motorMakeCode, motorModelCode, motorYearOfMake, coverageStartDate) {
            // action: findCarCc
            // motorMakeCode: 42
            // motorModelCode: 28
            // motorYearOfMake: 2019
            // coverageStartDate: 03/07/2020
            let apiUrl = this.baseUrl + '/dotCMS/purchase/buynow';
            if ((this.originalModelIsInvalid === true) && ((this.originalModelFromNcd === motorModelCode) === true)) return;

            return $.ajax({
                method: 'POST',
                url: apiUrl,
                data: {
                    action: 'findCarCc',
                    motorMakeCode,
                    motorModelCode,
                    motorYearOfMake,
                    coverageStartDate
                },
                dataType: 'json'
            }).promise()
        },
        /**
         * Returns a list of model variants for a particular model of motorcycle.
         */
        findMotorcycleModelVariants(motorMakeCode, motorModelCode, motorYearOfMake, motorCc, coverageStartDate) {
            // action: findCarVariants
            // motorMakeCode: 42
            // motorModelCode: 28
            // motorYearOfMake: 2019
            // motorCc: 113
            // coverageStartDate: 03/07/2020
            let apiUrl = this.baseUrl + '/dotCMS/purchase/buynow';

            if ((this.originalModelIsInvalid === true) && ((this.originalModelFromNcd === motorModelCode) === true)) return;

            return $.ajax({
                method: 'POST',
                url: apiUrl,
                data: {
                    action: 'findCarVariants',
                    motorMakeCode,
                    motorModelCode,
                    motorYearOfMake,
                    motorCc,
                    coverageStartDate
                },
                dataType: 'json'
            }).promise()
        },
        /**
         * Used in template to handle a change in the Cubic Capacity's field's value
         */
        async handleCcChanged() {
            const { motorMakeCode, motorModelCode, motorYearOfMake, motorCc, nxtNCDEffDt } = this.formData['2'];
            this.allModelVariants = await this.findMotorcycleModelVariants(motorMakeCode, motorModelCode, motorYearOfMake, motorCc, nxtNCDEffDt)
            if (this.allModelVariants != null) {
                this.formData['2'].motorModel = this.allModelVariants[0];
                this.handleMotorModelChanged()
            }

        },
        /**
         * Used in template to handle a change in the variant of the motorcycle
         */
        async handleMotorModelChanged() {

            if (this.formData['2'].motorModel != null) {
                this.formData['2'].motorModelCode = this.formData['2'].motorModel.modelCode;
                this.formData['2'].make = this.formData['2'].motorModel.make;
                this.formData['2'].family = this.formData['2'].motorModel.family;
            }
            else {
                // !!!!! should get name instead of code
                // this.formData['2'].make = this.formData['2'].motorMakeCode;
                this.formData['2'].make = this.formData['2'].motorMakeDescription
                this.formData['2'].family = this.formData['2'].family;
            }

            if (this.formData['2'].motorModel != null) {
                if (this.formData['2'].motorVehicleLocation != "" && (this.formData['2'].motorModel.cc == this.formData['2'].motorCc)) {
                    this.loading = true;
                    await this.findVehicleSumInsured()
                    this.loading = false;
                }
            }

        },
        async handleMotorcycleLocationChanged() {

            if (this.formData['2'].motorModel != null) {
                if (this.formData['2'].motorVehicleLocation != "" && (this.formData['2'].motorModel.cc == this.formData['2'].motorCc)) {
                    this.loading = true;
                    await this.findVehicleSumInsured()
                    this.loading = false;
                }
            }
        },
        async findVehicleSumInsured() {
            if (!this.formData['2'].motorVehicleLocation || !this.formData['2'].motorModel) return;

            let apiUrl = this.baseUrl + '/dotCMS/purchase/buynow';
            const motorSumInsured = await $.ajax({
                type: "POST",
                url: apiUrl,
                dataType: 'json',
                data: {
                    action: "findMotorcycleSumInsured",
                    partnerCode: this.partnerCode,
                    productCode: this.productCode,
                    productName: this.productName,
                    motorNxtNcdLevel: this.formData['2'].nxtNCDLevel,
                    motorNvic: this.formData['2'].motorModel.nvic,
                    motorVehicleLocation: this.formData['2'].motorVehicleLocation ? this.formData['2'].motorVehicleLocation.vpmsStateCode : '',
                    coverageStartDate: this.formData['2'].nxtNCDEffDt,
                    motorCc: this.formData['2'].motorCc,
                    motorMakeCode: this.formData['2'].motorMakeCode,
                    motorYearOfMake: this.formData['2'].motorYearOfMake,
                    motorModelCode: this.formData['2'].motorModelCode,
                    motorChassisNo: this.formData['2'].motorRiskDataChassisNo,
                    motorRegistrationNo: this.formData['1'].motorRegistrationNo,
                    motorVehiclePremiumValue: '',
                    certificateNo: '', // According to Inventech, this is applicable when it is a renewal with MSIG
                    policyHolderMalaysian: this.formData['1'].policyHolderIdType === 'nric' ? 'Y' : 'N',
                    policyHolderNRIC: this.formData['1'].policyHolderNric,
                    staffId: this.staffId,
                    branchAbbr: this.branchCode,
                    staffRelationship: this.staffRelationship
                }
            }).promise()

            this.formData['2'] = {
                ...this.formData['2'],
                ...motorSumInsured
            }

            this.formData['2'].sumInsuredType = this.formData['2'].sumInsuredType === 'MarketValue' ? 'marketValue' : 'recomendedValue';

            if (!motorSumInsured.canProceed) {
                this.errorMessage = '<p>The car sum insured is not available in the system.  Please download the application form <a style="width: auto; height: auto; display: inline-block; line-height: initial; background: transparent;text-decoration:underline" href="../../resource/Motor_ProposalForm.pdf" target="_blank"><b><u> here </u></b></a> and email to us.</p>'
                this.canProceed = false;
                sessionStorage.removeItem('m3pa_data')
            }
        },

        async findErrorByErrorCodeAsync(errorCode) {
            const queryObj = {
                errorCode
            }
            const dotCMSQueryURL = this.createDotCMSQueryURL('TieRefBancaMotorErrorMessage', queryObj, true)
            const apiResp = await $.ajax({
                method: 'GET',
                dataType: 'json',
                url: dotCMSQueryURL
            })
            return apiResp.contentlets[0].errorMessage
        },
        checkBlacklist() {
            let apiUrl = this.baseUrl + '/dotCMS/purchase/buynow';
            return $.ajax({
                method: 'POST',
                url: apiUrl,
                dataType: 'json',
                data: {
                    action: "blackListedCheck",
                    productCode: this.productCode,
                    policyHolderNRIC: this.formData['1'].policyHolderNric,
                    motorRegistrationNo: this.formData['1'].motorRegistrationNo
                }
            }).promise()
        },
        getPostcodesAsync: async function (postcode) {
            const dotCMSQueryURL = this.baseUrl +
                '/api/content/render/false/type/json/limit/0/query/' +
                '+structureName:TieRefCity%20' +
                '+(conhost:ceaa0d75-448c-4885-a628-7f0c35d374bd%20conhost:SYSTEM_HOST)%20' +
                '+TieRefCity.postcode:' + postcode + '*' +
                '/orderby/TieRefCity.postcode'

            const apiResp = await $.ajax({
                method: 'GET',
                url: dotCMSQueryURL,
                dataType: 'json'
            }).promise()

            this.postcodeSuggestions = apiResp.contentlets;
        },
        getLoanProvidersAsync: async function (name) {
            const dotCMSQueryURL = this.baseUrl +
                '/api/content/render/false/type/json/limit/0/query/' +
                '+structureName:TieRefBancaLoanProvider%20' +
                '+(conhost:ceaa0d75-448c-4885-a628-7f0c35d374bd%20conhost:SYSTEM_HOST)%20' +
                '+live:true%20' +
                '+TieRefBancaLoanProvider.financeName:' + name + '*' +
                '/orderby/TieRefBancaLoanProvider.financeName'

            const apiResp = await $.ajax({
                method: 'GET',
                url: dotCMSQueryURL,
                dataType: 'json'
            }).promise()

            this.loanProviderSuggestions = apiResp.contentlets;
        },
        getOccupationAsync: async function (occu) {
            const dotCMSQueryURL = this.baseUrl +
                '/api/content/render/false/type/json/limit/0/query/' +
                '+structureName:TieRefOccupationMotorAndMotorcycle%20' +
                '+(conhost:ceaa0d75-448c-4885-a628-7f0c35d374bd%20conhost:SYSTEM_HOST)%20' +
                '+live:true%20' +
                '+TieRefOccupationMotorAndMotorcycle.tieList:' + occu + '*' +
                '/orderby/TieRefOccupationMotorAndMotorcycle.tieList'

            const apiResp = await $.ajax({
                method: 'GET',
                url: dotCMSQueryURL,
                dataType: 'json'
            }).promise()

            this.occupationSuggestions = apiResp.contentlets;
            console.log("api : " + this.occupationSuggestions);
            if(this.occupationSuggestions == ""){
                if(this.currStep.stepNum == '2'){
                    console.log("this.currStep.stepNum == '2' invalid edit input");
                    this.formData['2'].policyHolderOccupation = "";
                    this.formData['2'].memberOccupation = "";
                }
                if(this.currStep.stepNum == '4'){
                    console.log("this.currStep.stepNum == '4' invalid edit input");
                    this.formData['4'].policyHolderOccupation = "";
                    this.formData['4'].memberOccupation = "";
                }
                console.log("api output null - input cleared");
            }
        },
        handlePostcodeHit: async function (cityObj) { //if key in 5 char will hit this?
            this.formData['2'].addressPostcode = cityObj.postcode;
            this.formData['2'].addressCity = cityObj.cityDescription;

            const stateQuery = {
                'stateCode': cityObj.stateCode
            }
            const dotCMSQueryURL = this.createDotCMSQueryURL('TieRefState', stateQuery, true)
            const stateApiResp = await $.ajax({
                method: 'GET',
                dataType: 'json',
                url: dotCMSQueryURL
            }).promise()

            this.formData['2'].addressState = stateApiResp.contentlets[0].stateDescription;
            this.currSelectedPostcode = cityObj;
        },
        getDayName: function (dateString) {
            return moment(dateString, 'DD/MM/YYYY').format('ddd')
        },
        scrollToError: function () {
            const isMobile = window.innerWidth < 768;
            let $errors = $('.wizard-section-' + this.currStep.stepNum).find('.is-invalid, .error-input');
            if (isMobile) {
                $errors = $errors.filter(function () { return $(this).parents('.d-none').length === 0 })
            }
            if ($errors.length && $errors.first()) {
                let offset = $errors.first().offset().top - 10
                scrollTo(offset)
            }
        },
        scrollToPosition: function (pos, speed) {
            return new Promise((resolve, reject) => {
                $("body, html").animate({
                    scrollTop: pos
                }, speed, () => resolve())
            })
        },
        calculatePremiumAsync: async function () {
            this.loading = true;
            const apiResp = await $.ajax({
                method: 'POST',
                url: this.baseUrl + '/dotCMS/purchase/buynow',
                // url: 'https://www.mocky.io/v2/5e7200e33300004f0044c5a1',
                dataType: 'json',
                data: {
                    action: 'calculatePremium',
                    memberRelationship: 'Driver',
                    motorNvic: this.formData['2'].motorModel.nvic,
                    motorVehicleLocation: this.formData['2'].motorVehicleLocation.vpmsStateCode,
                    motorNxtNcdLevel: this.formData['2'].nxtNCDLevel,
                    motorAddLegalLiabilityToPassengers: '', // TODO: CHECK THIS!
                    motorAddLegalLiabilityOfPassengers: this.formData['3'].motorAddLegalLiabilityOfPassengers ? 'Y' : '',
                    motorAddLegalLiabilityToPillion: this.formData['3'].motorAddLegalLiabilityToPillion ? 'Y' : '',
                    motorAddSpecialPerils: this.formData['3'].motorAddSpecialPerils ? 'Y' : '',
                    motorAddSRCC: this.formData['3'].motorAddSRCC ? 'Y' : '',
                    motorAddRiderPA: this.formData['3'].motorAddRiderPA ? 'Y' : '',
                    productCode: this.productCode,
                    partnerCode: this.partnerCode,
                    coverageStartDate: this.formData['2'].nxtNCDEffDt,
                    coverageExpiryDate: this.formData['2'].nxtNCDExpDt,
                    policyHolderNRIC: this.formData['1'].policyHolderNric,
                    policyHolderGender: this.policyHolderGender,
                    policyHolderMalaysian: this.isIdNric ? 'Y' : '',
                    policyHolderDateOfBirth: moment(this.policyHolderDob).format('DD/MM/YYYY'),
                    motorCc: this.formData['2'].motorCc,
                    motorMakeCode: this.formData['2'].motorMakeCode,
                    motorYearOfMake: this.formData['2'].motorYearOfMake,
                    motorModelCode: this.formData['2'].motorModelCode,
                    motorChassisNo: this.formData['2'].motorRiskDataChassisNo,
                    motorRegistrationNo: this.formData['1'].motorRegistrationNo,
                    motorSeat: this.formData['2'].seat,
                    motorStyle: this.formData['2'].style,
                    motorVariant: this.formData['2'].variant,
                    motorTransmission: this.formData['2'].transmission,
                    motorFamily: this.formData['2'].family,
                    motorMake: this.formData['2'].make,
                    motorVehiclePremiumValue: this.formData['2'].sumInsuredType, // confusing naming here
                    dpfstatus: this.formData['2'].dpfStatus, // this passed back during NCD checking
                    productName: this.productName,
                    addressState: this.formData['2'].addressStateCode,
                    staffRelationship: this.staffRelationship,
                    staffId: this.staffId,
                    motorPlusPlan: this.formData['3'].motorPlanType === 'comprehensive' ? '' : 'Y',
                    allRiderPlan: this.formData['3'].allRiderPlan ? 'Y' : '',
                }
            })

            this.formData['3'] = {
                ...this.formData['3'],
                ...apiResp
            }

            //console.log(apiResp);

            const { maxSumInsured, minSumInsured } = this.underwrittenRules;
            if (this.formData['3'].sumInsured > maxSumInsured) {
                this.formData['3'].sumInsured = maxSumInsured;
            }

            if (this.formData['3'].sumInsured < minSumInsured) {
                this.formData['3'].sumInsured = minSumInsured;
            }

            if (this.formData['3'].loading === null) {
                this.formData['3'].loading = 0;
            }

            if (this.formData['3'].loadingPct === null) {
                this.formData['3'].loadingPct = 100;
            }

            this.loading = false;

            this.formData['3'].commissionRate = this.commissionRate;
        },
        formatAsCurrency: function (number) {
            return number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        },
        formatAsNonDecimal: function (number) {
            return parseFloat(number).toFixed(0);
        },
        initializeTooltips: function () {
            this.$nextTick().then(() => {
                const currStepNum = this.currStep.stepNum;
                const $tooltips = $(this.$el).find(`.wizard-section-${currStepNum} [data-toggle=tooltip]`);
                $tooltips.each(function () {
                    if (!$(this).hasClass('tooltip-initialized')) {
                        $(this).tooltip()
                        $(this).addClass('tooltip-initialized')
                    } else {
                        $(this).tooltip('update')
                    }
                })
            })
        },

        // Step 4 Related
        cancelEditMotorDetails: function () {
            this.formData['4'].motorVehicleLocation = this.formData['2'].motorVehicleLocation;
            this.formData['4'].isMotorDetailsEditMode = false;
            this.handleMotorcycleLocationChanged()
        },
        saveEditMotorDetails: function () {
            this.formData['2'].motorVehicleLocation = this.formData['4'].motorVehicleLocation;
            this.formData['4'].isMotorDetailsEditMode = false;
            this.calculatePremiumAsync()
        },
        cancelEditRiderDetails: function () {
            this.formData['4'].policyHolderName = this.formData['2'].policyHolderName;
            this.formData['4'].policyHolderEmail = this.formData['2'].policyHolderEmail;
            this.formData['4'].policyHolderMobileNo = this.formData['2'].policyHolderMobileNo;
            this.formData['4'].policyHolderAddressLine1 = this.formData['2'].policyHolderAddressLine1;
            this.formData['4'].policyHolderAddressLine2 = this.formData['2'].policyHolderAddressLine2;
            this.formData['4'].addressPostcode = this.formData['2'].addressPostcode;
            this.formData['4'].addressState = this.formData['2'].addressState;
            this.formData['4'].addressStateCode = this.formData['2'].addressStateCode;
            this.formData['4'].addressCity = this.formData['2'].addressCity;
            this.formData['4'].policyHolderMaritalStatus = this.formData['2'].policyHolderMaritalStatus;
            this.formData['4'].policyHolderOccupation = this.formData['2'].policyHolderOccupation;
            this.formData['4'].policyHolderOccupationItemCode = this.formData['2'].policyHolderOccupationItemCode;
            this.formData['4'].memberOccupation = this.formData['2'].memberOccupation;
            this.formData['4'].memberOccupationItemCode = this.formData['2'].memberOccupationItemCode;

            // wj - membership ID
            this.formData['4'].membershipID = this.formData['2'].membershipID;

            this.formData['4'].isRiderDetailsEditMode = false;
        },
        saveEditRiderDetails: async function () {
            const isValid = await this.$refs.editRiderObserver.validate();
            if (!isValid) {
                this.scrollToError()
                return
            };

            this.formData['2'].policyHolderName = this.formData['4'].policyHolderName;
            this.formData['2'].policyHolderEmail = this.formData['4'].policyHolderEmail;
            this.formData['2'].policyHolderMobileNo = this.formData['4'].policyHolderMobileNo;
            this.formData['2'].policyHolderAddressLine1 = this.formData['4'].policyHolderAddressLine1;
            this.formData['2'].policyHolderAddressLine2 = this.formData['4'].policyHolderAddressLine2;
            this.formData['2'].addressPostcode = this.formData['4'].addressPostcode;
            this.formData['2'].addressState = this.formData['4'].addressState;
            this.formData['2'].addressStateCode = this.formData['4'].addressStateCode;
            this.formData['2'].addressCity = this.formData['4'].addressCity;
            this.formData['2'].policyHolderMaritalStatus = this.formData['4'].policyHolderMaritalStatus;
            this.formData['2'].policyHolderOccupation = this.formData['4'].policyHolderOccupation;
            this.formData['2'].policyHolderOccupationItemCode = this.formData['4'].policyHolderOccupationItemCode;
            this.formData['2'].memberOccupation = this.formData['4'].memberOccupation;
            this.formData['2'].memberOccupationItemCode = this.formData['4'].memberOccupationItemCode;

            // wj - membership ID
            this.formData['2'].membershipID = this.formData['4'].membershipID;

            this.formData['4'].isRiderDetailsEditMode = false;
            this.calculatePremiumAsync()
        },
        processPurchaseStep1: function () {
            const $form = $(this.$el).find('form#summary-form-placeholder');
            //console.log(this.formData['2'].policyHolderOccupationItemCode);
            $form.attr('action', this.summaryUrl)
            const data = {
                action: "processPurchase",
                actionType: "Step1",
                partnerCode: this.partnerCode,
                productCode: this.productCode,
                branch: '',
                productName: this.productName,
                productGroup: this.productGroup,
                prefixMobile: this.prefixMobile,
                formula: 'motor',
                allowMotorPlusPlan: '',
                staffId: this.staffId,
                staffRelationship: this.staffRelationship,
                enableCcDropDown: this.formData['2'].enableCcDropDown,
                policyStartDate: '',
                policyEndDate: '',
                policyStartDate: '',
                policyEndDate: '',
                coverageStartDate: this.formData['3'].coverageStartDate,
                coverageExpiryDate: this.formData['3'].coverageExpiryDate,
                coveragePlan: this.coveragePlan,
                coveragePremiumRate: this.coveragePremiumRate,
                coveragePremiumUpgradeRate: this.coveragePremiumUpgradeRate,
                coveragePremiumType: this.coveragePremiumType,
                coveragePremiumDiscount: this.formData['3'].discountAmount,
                coverageStampDuty: this.formData['3'].stampDuty,
                totalPremium: this.formData['3'].totalPayable,
                minimumCoverage: 1,
                totalDaysSelected: '',
                totalPersonToCalc: 1,
                noDaysCovered: this.formData['3'].daysOfCoverage,
                productMinAge: this.productMinAge,
                productMinAgeUnit: this.productMinAgeUnit,
                productMaxAge: this.productMaxAge,
                productMaxAgeUnit: this.productMaxAgeUnit,
                maxCoverDuration: this.maxCoverDuration,
                maxCoverDurationUnit: this.maxCoverDurationUnit,
                refAddress1: '',
                refAddress2: '',
                addressOverwriteIndicator: '',
                isInIframe: this.isInIframe,
                prescreenYesNo: 'Y',
                carOwnerMalaysian: this.isIdNric ? 'Y' : 'N',
                motorNcdCheckNRIC: this.isIdNric ? this.formData['1'].policyHolderNric : '',
                motorNcdCheckPassport: this.isIdNric ? '' : this.formData['1'].policyHolderNric,
                motorRegistrationNo: this.formData['1'].motorRegistrationNo,
                motorChassisNo: this.formData['2'].motorRiskDataChassisNo,
                privacyNoticeCheckbox: 'Y',
                motorNxtNcdLevel: this.formData['2'].nxtNCDLevel,
                motorNxtNcdEffDate: this.formData['2'].nxtNCDEffDt,
                motorCurNcdLevel: this.formData['2'].curNCDLevel,
                motorCurNcdEffDate: this.formData['2'].curNCDEffDt,
                motorCurNcdExpDate: this.formData['2'].curNCDExpDate,
                certificateNo: this.certificateNo, // to check if needed
                motorChassisNo: this.formData['2'].motorRiskDataChassisNo,
                motorMakeCode: this.formData['2'].motorMakeCode,
                motorModelCode: this.formData['2'].motorModelCode,
                motorCc: this.formData['2'].motorCc,
                motorYearOfMake: this.formData['2'].motorYearOfMake,
                motorSeat: this.formData['2'].seat,
                motorStyle: this.formData['2'].style,
                motorTransmission: this.formData['2'].transmission,
                motorVariant: this.formData['2'].variant,
                motorFamily: this.formData['2'].family,
                motorMake: this.formData['2'].make,
                motorNvic: this.formData['2'].motorModel.nvic,
                motorDisplayNxtNcd: this.formData['2'].nxtNCDDiscount + '%',
                ISMEngineNo: this.formData['2'].ISMEngine,
                motorAddOnEHailing: '',
                dpfStatus: '',
                motorAddBettermentEndorsementCode: '',
                motorAddBettermentRenewal: '',
                CheckTotalDriverMax2: 'N',
                motorEngineNo: this.formData['2'].motorEngineNo,
                motorLoanProvider: this.formData['2'].motorLoanProvider && this.loanProviderSuggestions.find(l => l.financeName === this.formData['2'].motorLoanProvider).financeCode || '',
                motorLoanProviderDesc: this.formData['2'].motorLoanProvider,
                policyHolderNationality: this.formData['1'].country,
                editCarInfoSpecification: this.formData['2'].motorModel.nvic,
                motorVehicleLocationStateCode: this.formData['2'].motorVehicleLocation.code,
                motorVehicleLocation: this.formData['2'].motorVehicleLocation.vpmsStateCode,
                motorLoanProviderDescription: this.formData['2'].motorLoanProvider,
                policyHolderMalaysian: this.isIdNric ? 'Y' : 'N',
                policyHolderName: this.formData['2'].policyHolderName,
                policyHolderNRIC: this.isIdNric ? this.formData['1'].policyHolderNric : '',
                policyHolderPassport: this.isIdNric ? '' : this.formData['1'].policyHolderNric,
                policyHolderGender: this.policyHolderGender,
                policyHolderDateOfBirth: moment(this.policyHolderDob).format('DD/MM/YYYY'),
                policyHolderEmail: this.formData['2'].policyHolderEmail,
                policyHolderMobileNo: this.mobileNumber,
                policyHolderAddressLine1: this.formData['2'].policyHolderAddressLine1,
                policyHolderAddressLine2: this.formData['2'].policyHolderAddressLine2,
                addressPostcode: this.formData['2'].addressPostcode,
                addressState: this.postcodeSuggestions.find(a => a.cityDescription === this.formData['2'].addressCity).stateCode,
                addressCity: this.postcodeSuggestions.find(a => a.cityDescription === this.formData['2'].addressCity).cityCode,
                policyHolderMaritalStatus: this.formData['2'].policyHolderMaritalStatus === 'Married' ? 'M' : 'S',
                policyHolderOccupation: this.formData['2'].policyHolderOccupation,
                //comment for local test
                occupationItemCode: this.occupationSuggestions.find(a => a.tieList === this.formData['2'].policyHolderOccupation).descitem,
                motorSumInsured: this.formData['2'].marketValue,
                numberOfAdditionalDriver: '',
                allRiderPlan: this.formData['3'].allRiderPlan ? 'Y' : '',
                comprehensiveMotorcycle: this.formData['3'].motorPlanType === 'comprehensive' ? 'Y' : '',
                motorcycleAllRiders: this.formData['3'].allRiderPlan ? 'Y' : '',
                basicPremium: this.formData['3'].basePremium,
                ncdAmount: this.formData['3'].ncdAmount,
                netNcdAmount: this.netNCDAmount,
                annualPremium: this.grossPremium,
                discount: this.formData['3'].discountAmount,
                sst: this.formData['3'].sst,
                sstVal: this.formData['3'].sstAmount,
                stampDuty: this.formData['3'].stampDuty,
                grandTotal: this.formData['3'].totalPayable,
                additionalPremium: this.formData['3'].totalAdditionalCoveragePremium,
                driverQuantity: '',
                driverPremium: '',
                allRiderPlanPremium: this.formData['3'].allRiderPlanPremium || '',
                legalLiabilityToPassengersPremium: this.formData['3'].addLegalLiabilityToPassengersPremium || '',
                legalLiabilityOfPassengersPremium: this.formData['3'].addLegalLiabilityOfPassengersPremium,
                legalLiabilityToPillionPremium: this.formData['3'].addLegalLiabilityToPillionPremium,
                specialPerilsPremium: this.formData['3'].addSpecialPerilsPremium || '',
                srccPremium: this.formData['3'].addSRCCPremium || '',
                riderPAPremium: this.formData['3'].addRiderPAPremium || '',
                hasUpgrade: 'N',
                memberName: this.formData['2'].policyHolderName,
                memberCountry: this.formData['1'].country,
                memberIdNo: this.formData['1'].policyHolderNric,
                memberRelationship: 'Driver',
                driverRelationship: '00',
                memberDOB: moment(this.policyHolderDob).format('DD/MM/YYYY'),
                memberMotorDrivingExperience: '',
                memberIsMalaysian: this.isIdNric ? 'Y' : 'N',
                memberIsMalaysian: this.isIdNric ? 'Y' : 'N',
                memberOccupation: this.formData['2'].policyHolderOccupation,
                memberGender: this.policyHolderGender,
                //comment for local test
                memberOccupationItemCode: this.occupationSuggestions.find(a => a.tieList === this.formData['2'].policyHolderOccupation).descitem,
                // wj - membership ID
                membershipID: this.formData['2'].membershipID,
                originalModel99: this.formData['2'].originalModel99,
            }

            $form.append(
                Object
                    .keys(data)
                    .map(key => $(`<input type="hidden" name="${key}" value="${data[key]}">`))
            )
            $form.trigger('submit', data)
        },
        // Step 5
        initiatePayment: function () {
            this.originalModel99 = $('input[name=originalModel99]').val();
            return $
                .ajax({
                    method: 'POST',
                    url: this.baseUrl + '/dotCMS/purchase/buynow',
                    data: {
                        action: "processPurchase",
                        actionType: "Step2",
                        partnerCode: this.partnerCode,
                        productCode: this.productCode,
                        productName: this.productName,
                        prescreenYesNo: 'Y',
                        staffRelationship: this.staffRelationship,
                        isInIframe: this.isInIframe,
                        gstRate: 'N',
                        sstRate: 'N',
                        destSelect: 'N',
                        formula: 'motor',
                        certificateNo: this.certificateNo, // to check if needed
                        motorRegistrationNo: this.formData['1'].motorRegistrationNo,
                        motorChassisNo: this.formData['2'].motorRiskDataChassisNo,
                        dpfStatus: 'false',
                        motorMakeCode: this.formData['2'].motorMakeCode,
                        motorModelCode: this.formData['2'].motorModelCode,
                        enableCcDropDown: this.formData['2'].enableCcDropDown,
                        motorCc: this.formData['2'].motorCc,
                        motorYearOfMake: this.formData['2'].motorYearOfMake,
                        motorStyle: this.formData['2'].style,
                        motorSeat: this.formData['2'].seat,
                        motorVariant: this.formData['2'].variant,
                        motorTransmission: this.formData['2'].transmission,
                        motorFamily: this.formData['2'].family,
                        motorMake: this.formData['2'].make,
                        motorNxtNcdLevel: this.formData['2'].nxtNCDLevel,
                        motorNxtNcdEffDate: this.formData['2'].nxtNCDEffDt,
                        motorCurNcdLevel: this.formData['2'].curNCDLevel,
                        motorCurNcdEffDate: this.formData['2'].curNCDEffDt,
                        motorCurNcdExpDate: this.formData['2'].curNCDExpDate,
                        motorNvic: this.formData['2'].motorModel.nvic,
                        motorVehicleLocation: this.formData['2'].motorVehicleLocation.vpmsStateCode,
                        motorVehicleLocationStateCode: this.formData['2'].motorVehicleLocation.code,
                        motorVehiclePremiumValue: '',
                        motorDisplayNxtNcd: this.formData['2'].nxtNCDDiscount + '%',
                        motorSumInsured: this.formData['2'].marketValue,
                        ISMEngineNo: this.formData['2'].ISMEngine,
                        motorEngineNo: this.formData['2'].motorEngineNo,
                        motorLoanProvider: this.formData['2'].motorLoanProvider && this.loanProviderSuggestions.find(l => l.financeName === this.formData['2'].motorLoanProvider).financeCode || '',
                        motorLoanProviderDescription: this.formData['2'].motorLoanProvider,
                        motorAddLegalLiabilityToPassengers: this.formData['3'].motorAddLegalLiabilityToPassengers ? 'Y' : '',
                        motorAddLegalLiabilityOfPassengers: this.formData['3'].motorAddLegalLiabilityOfPassengers ? 'Y' : '',
                        motorAddLegalLiabilityToPillion: this.formData['3'].motorAddLegalLiabilityToPillion ? 'Y' : '',
                        motorAddSpecialPerils: this.formData['3'].motorAddSpecialPerils ? 'Y' : '',
                        motorAddWindscreen: '',
                        motorAddWindscreenSumInsured: 0,
                        motorAddSRCC: this.formData['3'].motorAddSRCC ? 'Y' : '',
                        motorAddRiderPA: this.formData['3'].motorAddRiderPA ? 'Y' : '',
                        motorAddUnlimitedTowing: '',
                        motorAddWaiverCompulsoryExcess: '',
                        motorAddEHailing: '',
                        motorAddOnEHailing: '',
                        motorAddBetterment: '',
                        motorAddBettermentEndorsementCode: '',
                        motorAddSmartKeyShield: '',
                        motorAddSmartKeyShieldSumInsured: 0,
                        motorAddDriverPersonalAccident: '',
                        motorAddDriverPersonalAccidentSumInsured: 0,
                        motorAdditonalDriver: 0,
                        motorAdditonalDriverPremium: 0,
                        motorAddLimitedSpecialPerils: '',
                        motorAddNcdRelief: '',
                        motorPlusPlan: this.formData['3'].motorPlanType === 'comprehensive' ? '' : 'Y',
                        motorPlusPlanPremium: '',
                        allRiderPlan: this.formData['3'].allRiderPlan ? 'Y' : '',
                        flexiPlan: '',
                        additionalPlanA: '',
                        additionalPlanB: '',
                        additionalPlanC: '',
                        motorAddCART: '',
                        motorAddCARTSumInsured: 0,
                        additionalPlan07: '',
                        additionalPlan14: '',
                        additionalPlan21: '',
                        agreeToTnC: 'Y',
                        coverageStartDate: this.formData['3'].coverageStartDate,
                        coverageExpiryDate: this.formData['3'].coverageExpiryDate,
                        policyHolderName: this.formData['2'].policyHolderName,
                        policyHolderNRIC: this.formData['1'].policyHolderNric,
                        policyHolderMalaysian: this.isIdNric ? 'Y' : 'N',
                        policyHolderGender: this.policyHolderGender,
                        policyHolderDrivingExp: '',
                        policyHolderDateOfBirth: moment(this.policyHolderDob).format('DD/MM/YYYY'),
                        policyHolderNationality: this.formData['1'].country,
                        policyHolderEmail: this.formData['2'].policyHolderEmail,
                        policyHolderMobileNo: this.mobileNumber,
                        policyHolderMaritalStatus: this.formData['2'].policyHolderMaritalStatus === 'Married' ? 'M' : 'S',
                        policyHolderOccupation: this.formData['2'].policyHolderOccupation,
                        //comment for local test
                        occupationItemCode: this.occupationSuggestions.find(a => a.tieList === this.formData['2'].policyHolderOccupation).descitem,
                        photo: '',
                        policyHolderAddressLine1: this.formData['2'].policyHolderAddressLine1,
                        policyHolderAddressLine2: this.formData['2'].policyHolderAddressLine2,
                        refAddress1: '',
                        refAddress2: '',
                        addressOverwriteIndicator: '',
                        addressPostcode: this.formData['2'].addressPostcode,
                        addressState: this.postcodeSuggestions.find(a => a.cityDescription === this.formData['2'].addressCity).stateCode,
                        addressCity: this.postcodeSuggestions.find(a => a.cityDescription === this.formData['2'].addressCity).cityCode,
                        propertyPostcode: '',
                        propertyAddressLine1: '',
                        propertyAddressLine2: '',
                        locationAddressLine1: '',
                        locationAddressLine2: '',
                        propertyState: '',
                        propertyCity: '',
                        studentId: '',
                        // wj - m3pa bug fixes: staffid and relationship is empty when reach here
                        staffId: this.formData['4'].staffId,
                        staffRelationship: this.formData['4'].staffRelationship,
                        // wj - end
                        campus: '',
                        coveragePlan: 'Basic',
                        coveragePremiumRate: 0,
                        branchAbbr: this.branchCode,
                        staffName: '',
                        agentNumber: '',
                        coveragePremiumType: 'default',
                        travelPlan: '',
                        travelArea: '',
                        travelBenefitPlan: '',
                        coveragePremiumDiscount: this.formData['3'].discountAmount,
                        coverageStampDuty: this.formData['3'].stampDuty,
                        noDaysCovered: this.formData['3'].daysOfCoverage,
                        totalPremium: this.formData['3'].totalPayable,
                        memberName: this.formData['2'].policyHolderName,
                        memberIdNo: this.formData['1'].policyHolderNric,
                        memberIsMalaysian: this.isIdNric ? 'Y' : 'N',
                        memberGender: this.policyHolderGender,
                        memberRelationship: 'Driver',
                        driverRelationship: '00',
                        memberDOB: moment(this.policyHolderDob).format('DD/MM/YYYY'),
                        memberMotorDrivingExperience: '',
                        memberOccupation: this.formData['2'].policyHolderOccupation,
                        //comment for local test
                        memberOccupationItemCode: this.occupationSuggestions.find(a => a.tieList === this.formData['2'].policyHolderOccupation).descitem,
                        memberPetBreed: '',
                        memberPetMicrochipId: '',
                        memberPhoto: '',

                        // wj - membership ID
                        membershipID: this.formData['4'].membershipID,
                        originalModel99: this.formData['2'].originalModel99,

                        basicPremium: this.formData['3'].basePremium,
                        ncdAmount: this.formData['3'].ncdAmount,
                        netNcdAmount: this.netNCDAmount,
                        annualPremium: this.grossPremium,
                        excess: this.formData['3'].motorPlanType === 'comprehensive' ? this.formData['3'].excess : '',
                        discount: this.formData['3'].discountAmount,
                        sst: this.formData['3'].sst,
                        sstVal: this.formData['3'].sstAmount,
                        stampDuty: this.formData['3'].stampDuty,
                        grandTotal: this.formData['3'].totalPayable,
                        additionalPremium: this.formData['3'].totalAdditionalCoveragePremium,
                        driverQuantity: '',
                        driverPremium: '',
                        allRiderPlanPremium: this.formData['3'].allRiderPlanPremium || '',
                        ncdReliefPremium: this.formData['3'].addNcdReliefPremium || '',
                        legalLiabilityToPassengersPremium: this.formData['3'].addLegalLiabilityToPassengersPremium || '',
                        legalLiabilityOfPassengersPremium: this.formData['3'].addLegalLiabilityOfPassengersPremium,
                        legalLiabilityToPillionPremium: this.formData['3'].addLegalLiabilityToPillionPremium,
                        specialPerilsPremium: this.formData['3'].addSpecialPerilsPremium || '',
                        limitedSpecialPerilsPremium: '',
                        unlimitedTowingPremium: '',
                        waiverCompulsoryExcessPremium: '',
                        srccPremium: this.formData['3'].addSRCCPremium || '',
                        riderPAPremium: this.formData['3'].addRiderPAPremium || '',
                        eHailingPremium: '',
                        bettermentPremium: '',
                        windscreenSumInsured: '',
                        smartKeyShieldSumInsured: '',
                        driverPersonalAccidentSumInsured: '',
                        cartSumInsured: '',
                    },
                    success: function (data) {
                        console.log(JSON.stringify(data))
                        // For local side redirection, since it doesnt auto redirect on my end, you may ignore
                        //uncomment for local test
                         //window.location.href = "http://localhost:8081/motorcycle-payment.html?action=processPurchase&actionType=Step1";
                    }
                })
                .promise()
        },

        async getUnderWrittenRules() {
            const data = await $.ajax({
                method: 'POST',
                url: this.baseUrl + '/dotCMS/purchase/buynow',
                dataType: 'json',
                data: {
                    action: 'underWrittenRule',
                    partnerCode: this.partnerCode,
                    productCode: this.productCode,
                    certificateNo: '',
                    motorSuminsured: ''
                }
            }).promise()
            this.underwrittenRules = data;
        },
        async getCountries() {
            const data = await $.ajax({
                method: 'GET',
                url: this.createDotCMSQueryURL('TieRefCountry', {}, true),
                dataType: 'json'
            }).promise()
            this.countries = _.sortBy(
                data.contentlets.reduce((acc, content) => {
                    acc.push({
                        name: content.name,
                        code: content.countryCode
                    })
                    return acc;
                }, []),
                'name'
            )
        },
        async getMalaysiaStates() {
            const data = await $.ajax({
                method: 'GET',
                url: this.createDotCMSQueryURL('TieRefState', {}, true),
                dataType: 'json'
            }).promise()

            this.states = _.sortBy(
                data.contentlets.reduce((acc, content) => {
                    acc.push({
                        name: content.stateDescription,
                        code: content.stateCode,
                        vpmsStateCode: content.vpmsStateCode
                    })
                    return acc;
                }, []),
                'name'
            )
        },
        // wj - to get staff relationship from contentlet then display as drop down list
        async getStaffRelationship() {
            const data = await $.ajax({
                method: 'GET',
                url: this.createDotCMSQueryURL('TieRefStaffRelationship', {}, true),
                dataType: 'json'
            }).promise()

            this.staff_relations = _.sortBy(
                data.contentlets.reduce((acc, content) => {
                    acc.push({
                        relationshipName: content.relationshipName,
                        staffRelationshipType: content.staffRelationshipType,
                        sequence: content.sequence,
                    })
                    return acc;
                }, []),
                ['staffRelationshipType', 'sequence'] //Sort order by staff relationship type, then sequence
            )
        },
        async getBankList() {
            const data = await $.ajax({
                method: 'GET',
                url: this.baseUrl + '/dotCMS/purchase/paynow/banklist',
                dataType: 'json'
            })
            this.banks = Array.isArray(data) ? data.filter(b => b.bankOnlineStatus === true) : []
            // this.banks = data.filter(b => b.bankOnlineStatus === true);
        },
        promptRestoreSession() {
            const $modal = $('#session-modal');
            return new Promise((resolve, reject) => {
                $modal.one('hidden.bs.modal', () => {
                    resolve(this.wishToRestoreSession)
                })
                $modal.modal('show')
            })
        },
        handleLoanProviderHit(value) {
            console.log(value);
        },
        handleOccupationHit: async function(value) {
            console.log("occu item code : "+value.descitem);
            this.formData['2'].policyHolderOccupationItemCode = value.descitem;  
            
            this.currSelectedOccupation = value;
        },
        rowMatchHeight() {
            let $group = $(this.$el).find('.selection-infobox-group');
            let $rows = $group.find('.row-match-height');

            let rowsByRowNum = {}
            $rows
                .filter(function () { return $(this).data('row-num') })
                .each(function () {
                    const rowNum = $(this).data('row-num')
                    if (!rowsByRowNum[rowNum]) {
                        rowsByRowNum[rowNum] = [this]
                    } else {
                        rowsByRowNum[rowNum].push(this)
                    }
                })

            Object
                .values(rowsByRowNum)
                .forEach(rows => {
                    const tallest = Math.max(...rows.map(r => r.clientHeight))
                    rows.forEach(r => r.style.height = tallest + 'px')
                })
        },
        checkAndSetHash() {
            let currHash = window.location.hash;
            if (currHash === '') {

            }
        },
        handlePlanTypeChange() {
            if (this.formData['3'].motorPlanType === 'm3pa') {
                this.formData['3'].motorAddRiderPA = true;
                this.formData['3'].motorAddSRCC = false
                this.formData['3'].motorAddSpecialPerils = false
            } else {
                this.formData['3'].motorAddRiderPA = false;
            }
            this.calculatePremiumAsync()
            this.initializeTooltips()
        },
        showTncModal() {
            $(this.$el).find('#tnc-modal').modal('show')
        },
        showSunwayPalsModal() {
            $(this.$el).find('#sunway-pals-modal').modal('show')
        }
    },
    computed: {
        isIdNric: function () {
            return this.formData['1'].policyHolderIdType === 'nric';
        },
        policyHolderGender: {
            cache: false,
            get() {
                if (!this.isIdNric) {
                    return this.formData['2'].policyHolderGender || ''
                }
                if (this.isIdNric) {
                    const last4Digits = this.formData['1'].policyHolderNric.split('-')[2]
                    return last4Digits % 2 === 1 ? 'M' : 'F'
                }
            },
            set(value) {
                this.formData['2'].policyHolderGender = value
            }
        },
        policyHolderDob: {
            get() {
                if (this.isIdNric) {
                    const nric = this.formData['1'].policyHolderNric;
                    return extractDOB(nric);
                }
                return this.formData['2'].policyHolderDateOfBirth;
            },
            set(value) {
                this.formData['2'].policyHolderDateOfBirth = value;
            }
        },
        fullAddress: function () {
            if(this.formData['2'].policyHolderAddressLine2 != ""){
                return `${this.formData['2'].policyHolderAddressLine1}, ${this.formData['2'].policyHolderAddressLine2}, ${this.formData['2'].addressPostcode} ${this.formData['2'].addressCity}, ${this.formData['2'].addressState}`
            }else{
                return `${this.formData['2'].policyHolderAddressLine1}, ${this.formData['2'].addressPostcode} ${this.formData['2'].addressCity}, ${this.formData['2'].addressState}`
            } 
        },
        cardType: function () {
            return getCardType(this.formData['5'].ccNo)
        },
        netNCDAmount: function () {
            return this.formData['3'].premiumOfNetNcd;
        },
        grossPremium: function () {
            return this.netNCDAmount + this.formData['3'].totalAdditionalCoveragePremium;
        },
        mobileNumber: function () {
            return this.formData['2'].policyHolderMobileNo.replace(/\s/g, '')
        },
        commission: function () {
            return this.grossPremium * this.commissionRate / 100;
        }
    },
    watch: {
        "formData.2.addressPostcode": _.debounce(async function (postcode) {
            await this.getPostcodesAsync(postcode)

            if (postcode.length === 5 && this.currSelectedPostcode && this.currSelectedPostcode.postcode != postcode) {
                this.currSelectedPostcode = null;
            }

            if (postcode.length === 5 && !this.currSelectedPostcode) {
                let suggestion = this.postcodeSuggestions.find(s => s.postcode == postcode);
                if (!suggestion) {
                    console.log('postcode not found in suggestions')
                    this.isNotKnownPostcode = true;
                    this.formData['2'].addressPostcode = "";
                    return;
                }

                this.formData['2'].addressCity = suggestion.cityDescription;
                this.formData['2'].addressState = this.states.find(s => s.code === suggestion.stateCode).name;
                this.isNotKnownPostcode = false;
                return;
            }
        }, 500),
        "formData.4.addressPostcode": _.debounce(async function (postcode) {
            await this.getPostcodesAsync(postcode)

            if (postcode.length === 5 && this.currSelectedPostcode && this.currSelectedPostcode.postcode != postcode) {
                this.currSelectedPostcode = null;
            }

            if (postcode.length === 5 && !this.currSelectedPostcode) {
                let suggestion = this.postcodeSuggestions.find(s => s.postcode == postcode);
                if (!suggestion) {
                    console.log('postcode not found in suggestions')
                    this.isNotKnownPostcode = true;
                    this.formData['4'].addressPostcode = "";
                    return;
                }

                this.formData['4'].addressCity = suggestion.cityDescription;
                this.formData['4'].addressState = this.states.find(s => s.code === suggestion.stateCode).name;
                this.isNotKnownPostcode = false;

                return;
            }
        }, 500),
        "formData.1.policyHolderNric": function (value) {
            if (this.isIdNric) {
                this.formData['2'].policyHolderGender = this.nricGender;
            }
        },
        "formData.2.motorLoanProvider": _.debounce(function (name) {
            this.getLoanProvidersAsync(name)
        }, 500),
        "formData.2.policyHolderOccupation": _.debounce(async function (occu) {
            await this.getOccupationAsync(occu)
            //this field cleared after 31st character entry still not a valid input
            //
            //console.log("occu up : " + occu.toLocaleUpperCase());
            occu = occu.toLocaleUpperCase();
            console.log("occu up 2.0 : " + occu);
            //if (occu.length > 30 && this.currSelectedOccupation && this.currSelectedOccupation.description != occu) {
            if (occu.length > 30 && this.currSelectedOccupation && this.currSelectedOccupation.tieList != occu) {
                this.currSelectedOccupation = null;
            }

            //nuimei
            //console.log(this.occupationSuggestions);
            if (!this.currSelectedOccupation) {
                let suggestion = this.occupationSuggestions.find(s => s.tieList == occu);
                //let suggestion = this.occupationSuggestions.find(s => s.description == occu);
                if (!suggestion && occu.length > 30) {
                    console.log('occupation not found in suggestions')
                    this.isNotKnownOccupation = true;
                    this.formData['2'].policyHolderOccupation = "";
                    this.formData['2'].memberOccupation = "";
                    return;
                }
                else if(suggestion != undefined){
                    //update new item code
                    //console.log("suggestion: " + suggestion);
                    console.log("occu: " + occu);
                    this.formData['2'].policyHolderOccupation = occu;
                    this.formData['2'].memberOccupation = occu;
                    console.log('occupation FOUND !!!: ' + suggestion.descitem);
                    this.formData['2'].policyHolderOccupationItemCode = suggestion.descitem;
                    this.formData['2'].memberOccupationItemCode = suggestion.descitem;
                    this.isNotKnownOccupation = false;
                    return;
                }
                 
            }
            //nuimei end


        }, 500),
        "formData.4.policyHolderOccupation": _.debounce(async function (occu) {
            await this.getOccupationAsync(occu)
            occu = occu.toLocaleUpperCase();
            //this field cleared after 5th character entry still not a valid input
            if (occu.length > 30 && this.currSelectedOccupation && this.currSelectedOccupation.tieList != occu) {
                this.currSelectedOccupation = null;
            }

            //nuimei
            if (!this.currSelectedOccupation) {
                let suggestion = this.occupationSuggestions.find(s => s.tieList == occu);
                if (!suggestion && occu.length > 30) {
                    console.log('occupation not found in suggestions')
                    this.isNotKnownOccupation = true;
                    this.formData['4'].policyHolderOccupation = "";
                    this.formData['4'].memberOccupation = "";
                    
                    return;
                }
                else if(suggestion != undefined){
                    //update new item code
                    this.formData['4'].policyHolderOccupation = occu;
                    this.formData['4'].memberOccupation = occu;
                    this.formData['4'].policyHolderOccupationItemCode = suggestion.descitem;
                    this.formData['4'].memberOccupationItemCode = suggestion.descitem;
                    this.isNotKnownOccupation = false;
                    return;
                }
                
            }
            //nuimei end
            
        }, 500),
        loading: function (value) {
            if (value) {
                return $('.page-loader').fadeIn()
            }
            $('.page-loader').fadeOut()
        }
    },
    mounted: async function () {
        this.loading = true;
        // $(window).on('unload', () => this.saveSession())
        this.getUnderWrittenRules()
        this.getCountries()
        this.getMalaysiaStates()
        this.getBankList()
        // wj - call get staff from contentlet during mounted life cycle
        this.getStaffRelationship()
        // wj - get and set max cc value when starting
        this.maxCCData = await this.getMaxCCData()
        //console.log("this.maxCCData in mounted: " + this.maxCCData);
        await this.maybeRestoreSession()
        this.initializeTooltips()
        this.loading = false;
        if(document.getElementById("membershipID")){
            this.setInputFilter(document.getElementById("membershipID"), function(value) {
                return /^\d*$/.test(value); 
            });
        }
        
    }
})