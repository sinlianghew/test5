import Vue from 'vue';
import $ from 'jquery';
import _ from 'lodash';
import { mask, masked } from 'vue-the-mask';
import moment from 'moment';
//import VueTypeaheadBootstrap from 'vue-typeahead-bootstrap/dist/VueBootstrapTypeahead.common';
import VueTypeaheadBootstrap from 'vue-typeahead-bootstrap/dist/VueTypeaheadBootstrap.common';

import { ValidationProvider, ValidationObserver } from 'vee-validate'
import { extractDOB, createDotCMSQueryURL, getCardType, scrollTo, getInputValueOrEmpty } from '../helpers/utilities';
import MiniPASummaryPane from '../components/miniPA-summary-pane';
import Datepicker from 'vuejs-datepicker';
import Swiper from 'swiper/js/swiper.js';

Vue.component('minipa-summary-pane', MiniPASummaryPane)
/**
 * Staff Relation: ['Direct Relationship']
 * 
 */

const m3paform = new Vue({
    el: '#miniPA-form',
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
        //isFpxPaymentGateway: getInputValueOrEmpty("isFpxPaymentGateway"),
        isFPXPaymentGateway:true,
        isBoostPaymentGateway: getInputValueOrEmpty("isBoostPaymentGateway"),        
        partnerUrlTitle: getInputValueOrEmpty("partnerUrlTitle"),
        partnerEmail: getInputValueOrEmpty("partnerEmail"),

        wishToRestoreSession: false,
        staffIDInvalid: false,

        // Check for duplicate NRIC or passport
        invalidNricList:[],
        invalidNric: false,  
        errorList:["Invalid NRIC or passport number.", "Invalid phone number"],

        steps: [{
                stepNum: '1',
                title: 'Get Started',
                completed: false,
                showStaffVerification: getInputValueOrEmpty("partnerCode") === 'msigstaff' ? true : false,
                showPrescreen: true,
                hash: 'prescreen'
            },
            { stepNum: '2', title: 'Plan Selection', completed: false, hash: 'planselection' },
            { stepNum: '3', title: 'Fill in Details', completed: false, hash: 'fillindetails' },
            { stepNum: '4', title: 'Review', completed: false, hash: '' },
            { stepNum: '5', title: 'Pay', completed: false, hash: '' }
        ],
        currStep: null,

        loading: false, // this controls the spinner
        canProceed: true,
        errorMessage: null,
        firstScreenError: '',

        // Data pulled in from dotCMS on pageload
        countries: null,
        states: null,
        banks: null,

        // Data used by the auto complete
        postcodeSearch: '',
        postcodeSuggestions: [],
        currSelectedPostcode: '',
        isNotKnownPostcode: false,

        // Data just for display
        swiperData:'',

        currentBullet: 1,
        paginationBullet:  ($(window).width() < 1183) && ($(window).width() > 974)? 3:2,
        
        formData: {
            1: {
                policyHolderIdType: 'nric',
                policyHolderCountry: '',
                policyHolderNric: '',
                policyHolderDateOfBirth: '',
                displayDateOfBirth: '',
                agreement: false

            },
            2: {               
                // jw - miniPA
                coverageStartDate: '',
                coverageEndDate: '',
                formattedCoverageStartDate: '',
                formattedCoverageEndDate: '',
                
                daysOfCoverage: '365',
                
                dateSelected: false,
                
                planSelected: false,
                planName:'',
                basePremium: '0',
                
                planAccidentalDeathPermanentDisablement:'',
                planBereavementAllowance:'',
                discountAmount: '0',   
                discountRate: getInputValueOrEmpty("discountRate"), 
                serviceTaxRate: getInputValueOrEmpty("serviceTaxRate"),             
                subTotal:'',
                serviceTax:'',
                stampDuty:'0.00',

                totalPayable:'0.00',
                planCode:'',

                sst: 'Y'
                

            },
            3: {
                // jw - mini PA
                policyHolderName:'',
                policyHolderEmail:'',
                policyHolderMobileNo:'',
                policyHolderAddressLine1:'',
                policyHolderAddressLine2:'',
                addressPostcode:'',
                addressCity:'',
                addressState:'',
                addressStateCode: '',

                // extra for foreigner
                policyHolderCountry:'',
                policyHolderGender:'',
                policyHolderDateOfBirth:'',

            },
            4: {
                tncAgreement: '',                
                isRiderDetailsEditMode: false,
                purchaseTempId: '',

                
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

                // extra for foreigner
                policyHolderCountry:'',
                policyHolderGender:'',
                policyHolderDateOfBirth:'',
                
                purchaseTempId:''

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

        hexTokens: {
            F: {
                pattern: /[0-9A-Za-z]/,
                transform: v => v.toLocaleUpperCase()
            }
        },

        disabledDates: {
            from: moment().endOf('year').subtract(16, "years").toDate(),
            to: moment().startOf('year').subtract(65, "years").toDate()
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
    methods: {
        
        /* jw - mini PA */
        openDate:function (){
            //moment().subtract(16, "years").toDate()
            var date = new Date();
            date = new Date(date.getFullYear() - 35, date.getMonth(),date.getDate() - 1);
            return date;
        },

        checkNric (){
            if (this.invalidNricList.includes(this.formData['1'].policyHolderNric.replace(/-/g,""))) this.invalidNric = true;
            else this.invalidNric = false;
        },

        updateDateOfBirth (){
            let tempDob = new Date (this.policyHolderDob);
            this.formData['1'].displayDateOfBirth = String(tempDob.getDate()).padStart(2,'0') + '/' + String(tempDob.getMonth()+1).padStart(2,'0') + '/' + tempDob.getFullYear();
        },

        // Function for swiper start
        initializeSwiper(){
            var number= 0;
            this.swiperData = new Swiper('.swiper-container', {    
                simulateTouch: false,
                slidesPerView: 'auto',
                spaceBetween: 20,
                preventClicks: true,
                preventClicksPropagation: false,
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                on:{
                    reachBeginning: function(){
                        var preEi =this.navigation.prevEl;
                        $(preEi).addClass("d-none");
                        var nexEi = this.navigation.nextEl;
                        $(nexEi).removeClass("d-none");
                        $(".swiper-slide").addClass("swiper-slide-opacity4");
                        $(".swiper-slide").removeClass("swiper-slide-opacity1");
                    },
                    reachEnd: function(){
                        number++;
                        if(number > 1){
                            var preEi =this.navigation.prevEl;
                            $(preEi).removeClass("d-none");
                            var nexEi = this.navigation.nextEl;
                            $(nexEi).addClass("d-none");
                            $(".swiper-slide").removeClass("swiper-slide-opacity4");
                            $(".swiper-slide").addClass("swiper-slide-opacity1");
                        }
                    }

                },
            });
        },

        getWindowWidth(){
            let width = $(window).width();
            if (width < 1183 && width > 974){ //making width small
                this.paginationBullet = 3;
                if (this.currentBullet == 2)this.currentBullet = 3;
                
            }else{ //making width large
                this.paginationBullet = 2;
                if (this.currentBullet > this.paginationBullet) {
                    this.currentBullet = this.paginationBullet;
                    this.hideNextButton();
                }
            };
        },

        resetPagination(){
            let width = $(window).width();
            this.currentBullet = 1;
            if (width < 1183 && width > 974){
                this.paginationBullet = 3;
            }else{
                this.paginationBullet = 2;
            }
        },

        swiperSlide: function (event) {

            if (event.target.className.includes("swiper-button-next")){
                    this.currentBullet ++;
                    if (this.currentBullet >= this.paginationBullet)
                    {
                        this.hideNextButton();
                        this.currentBullet = this.paginationBullet;
                    } else if (this.currentBullet == 2 && this.paginationBullet == 3){
                        this.showBothButton();
                    }
                
                    
            }else if (event.target.className.includes("swiper-button-prev")){
                this.currentBullet --;
                if (this.currentBullet <= 1)
                {
                    this.hidePrevButton();
                    this.currentBullet = 1;
                } else if (this.currentBullet == 2 && this.paginationBullet == 3){
                    this.showBothButton();
                }
                    
            }
            

        },      
        // Function for swiper end

        updatePolicyHolderGender(){
            if (this.isIdNric) {
                const last4Digits = this.formData['1'].policyHolderNric.split('-')[2]
                if (last4Digits % 2 === 1){
                    this.formData['3'].policyHolderGender = 'M'
                }else{
                    this.formData['3'].policyHolderGender = 'F'
                }
            }
        },

        updateEndDate(){

            let startD = new Date(this.formData['2'].coverageStartDate);

            this.formData['2'].coverageEndDate =  new Date (startD.valueOf() + 1000*60*60*24*364);
            let endD = new Date(this.formData['2'].coverageEndDate);

            this.formData['2'].formattedCoverageStartDate = String(startD.getDate()).padStart(2,'0') + "/" +String(startD.getMonth()+1).padStart(2,'0') + "/"+ String(startD.getFullYear());
            this.formData['2'].formattedCoverageEndDate =  String(endD.getDate()).padStart(2,'0') + "/" +String(endD.getMonth()+1).padStart(2,'0') + "/"+  String(endD.getFullYear()) ;
                
            this.formData['2'].dateSelected = true;
            
        },

        updateSummaryPane: function (tempData){
            this.formData['2'].basePremium = tempData.grossPremium.toFixed(2);
            this.formData['2'].discountAmount = tempData.discountAmount.toFixed(2);
            this.formData['2'].discountRate = tempData.discountRate.toFixed(0);
            this.formData['2'].subTotal = tempData.discountablePremium.toFixed(2);
            this.formData['2'].serviceTax = tempData.sstAmount.toFixed(2);
            this.formData['2'].serviceTaxRate = tempData.sst.toFixed(0);
            this.formData['2'].stampDuty = tempData.stampDuty.toFixed(2);

            this.formData['2'].totalPayable = tempData.totalPayable.toFixed(2);
        },

        togglePolicyHolderDetailsEditMode() {
            this.formData['4'].isRiderDetailsEditMode = true;
            $(".summaryBack").addClass("disabled");
            $(".summaryCheckout").addClass("disabled");            
            
        },

        calculatePremium: function () {
            return $
                .ajax({
                    method: 'POST',
                    url: this.baseUrl + '/dotCMS/purchase/buynow',
                    data: {
                        action: "calculatePremium",
                        actionType: "Step2",
                        partnerCode: this.partnerCode,
                        productCode: this.productCode,
                        productName: this.productName,
                        prescreenYesNo: 'Y',
                        staffRelationship: this.staffRelationship,
                        coveragePlan: "MOGMG" + this.formData['2'].planName [this.formData['2'].planName.length - 1],
                        formula: 'mini-personal-accident',
                        certificateNo: this.certificateNo, // to check if needed
                       
                        coverageStartDate: this.formData['2'].formattedCoverageStartDate, //
                        coverageExpiryDate: this.formData['2'].formattedCoverageEndDate, //                
                                               
                    },
                    success: function (data) {
                        
                    }
                })
                .promise()
        },

        updatePlanDetails: function (event){

            this.formData['2'].planCode= "MOGMG" + this.formData['2'].planName [this.formData['2'].planName.length - 1];
            this.calculatePremium().then((data)=>{
                let tempData = JSON.parse(data);
                this.updateSummaryPane(tempData);
            });
            
            this.formData['2'].planSelected = true;
            let selectedPlan = event.target.className;
            this.formData['2'].planAccidentalDeathPermanentDisablement = $("#" + selectedPlan + "+ label .planAccidentalDeathPermanentDisablement").html();
            this.formData['2'].planBereavementAllowance = $("#" + selectedPlan + "+ label .planBereavementAllowance").html();


        },  

        minipaPolicyPurchaseTwiceOrRenewal:function(){
            var _this=this;
            return $.ajax({
                method: 'POST',
                url: this.baseUrl + '/dotCMS/purchase/buynow',
                data:{
                    action:"minipaPolicyPurchaseTwiceOrRenewal",
                    partnerCode: this.partnerCode,
                    productCode: this.productCode,
                    policyHolderNRIC: this.formData['1'].policyHolderNric,
                    coverageStartDate: this.formData['2'].formattedCoverageStartDate,
                    coverageExpiryDate: this.formData['2'].formattedCoverageEndDate,
                },
                error:function(respond){
                    console.log(respond);
                }
            }).promise().done(function(data){
                var dataParse = JSON.parse(data);
                    console.log("canProceed: "+dataParse.canProceed);
                    console.log("renewalMiniPa: "+dataParse.renewalMiniPa);
                    if(dataParse.canProceed =="true" && dataParse.renewalMiniPa =="true"){ // renewal case
                        _this.formData['3'].policyHolderName= dataParse.clientFullName !="null" ? dataParse.clientFullName : '';
                        _this.formData['3'].policyHolderEmail=dataParse.clientEmailAddress !="null" ? dataParse.clientEmailAddress : '';
                        _this.formData['3'].policyHolderMobileNo=dataParse.telephoneNumber1 !="null" ? dataParse.telephoneNumber1 : '';
                        _this.formData['3'].policyHolderAddressLine1=dataParse.clientAddressLine1 !="null" ? dataParse.clientAddressLine1 : '';
                        _this.formData['3'].policyHolderAddressLine2=dataParse.clientAddressLine2 !="null" ? dataParse.clientAddressLine2 : '';
                        _this.formData['3'].addressPostcode=dataParse.clientPostcode !="null" ? dataParse.clientPostcode : '';
                        _this.formData['3'].policyHolderGender=dataParse.clientSex !="null" ? dataParse.clientSex : '';
                        $('input[name="certificateNo"]').val(dataParse.certificateNo);
                    }
                    else if(dataParse.canProceed =="true" && dataParse.renewalMiniPa =="false"){
                        _this.formData['3'].policyHolderName='';
                        _this.formData['3'].policyHolderEmail='';
                        _this.formData['3'].policyHolderMobileNo='';
                        _this.formData['3'].policyHolderAddressLine1='';
                        _this.formData['3'].policyHolderAddressLine2='';
                        _this.formData['3'].addressPostcode='';
                        _this.formData['3'].policyHolderGender='';
                        $('input[name="certificateNo"]').val('');
                    }
                    // else new business (validate purchase twice at submit method)
                    //console.log(data);
            });
        },
        
         initiatePayment: function () {
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
                        sstRate: 'Y',
                        destSelect: 'N',
                        formula: 'mini-personal-accident',
                        certificateNo: this.certificateNo, // to check if needed
                        dpfStatus: 'false',
                        flexiPlan: '',
                        additionalPlanA: '',
                        additionalPlanB: '',
                        additionalPlanC: '',
                       
                        additionalPlan07: '',
                        additionalPlan14: '',
                        additionalPlan21: '',
                        agreeToTnC: 'Y',
                        coverageStartDate: this.formData['2'].formattedCoverageStartDate, //
                        coverageExpiryDate: this.formData['2'].formattedCoverageEndDate, //
                        policyHolderName: this.formData['3'].policyHolderName, //
                        policyHolderNRIC: this.formData['1'].policyHolderNric,
                        policyHolderMalaysian: this.isIdNric ? 'Y' : 'N',
                        policyHolderGender: this.policyHolderGender,
                        policyHolderDrivingExp: '',
                        policyHolderDateOfBirth: moment(this.policyHolderDob).format('DD/MM/YYYY'),
                        policyHolderNationality: this.formData['1'].policyHolderCountry ? this.formData['1'].policyHolderCountry : 'MAL',
                        policyHolderEmail: this.formData['3'].policyHolderEmail, //
                        policyHolderMobileNo: this.mobileNumber,
                        policyHolderMaritalStatus: '',
                        policyHolderOccupation: '',
                        
                        photo: '',
                        policyHolderAddressLine1: this.formData['3'].policyHolderAddressLine1, //
                        policyHolderAddressLine2: this.formData['3'].policyHolderAddressLine2, //
                        refAddress1: '',
                        refAddress2: '',
                        addressOverwriteIndicator: '',
                        addressPostcode: this.formData['3'].addressPostcode, //
                        addressState: this.postcodeSuggestions.find(a => a.cityDescription === this.formData['3'].addressCity).stateCode, //
                        addressCity: this.postcodeSuggestions.find(a => a.cityDescription === this.formData['3'].addressCity).cityCode, //
                        propertyPostcode: '',
                        propertyAddressLine1: '',
                        propertyAddressLine2: '',
                        locationAddressLine1: '',
                        locationAddressLine2: '',
                        propertyState: '',
                        propertyCity: '',
                        studentId: '',
                        staffId: this.staffId,
                        staffRelationship: this.staffRelationship,
                        campus: '',
                        coveragePlan: this.formData['2'].planCode,
                        coveragePremiumRate: 0,
                        branchAbbr: this.branchCode,
                        staffName: '',
                        agentNumber: '',
                        coveragePremiumType: 'default',
                        travelPlan: '',
                        travelArea: '',
                        travelBenefitPlan: '',
                        coveragePremiumDiscount: this.formData['2'].discountAmount, //
                        coverageStampDuty: this.formData['2'].stampDuty, //
                        noDaysCovered: this.formData['2'].daysOfCoverage, //
                        totalPremium: this.formData['2'].totalPayable, //
                        //memberName: this.formData['3'].policyHolderName, //
                        //memberIdNo: this.formData['1'].policyHolderNric,
                        //memberIsMalaysian: this.isIdNric ? 'Y' : 'N',
                        memberName: '',
                        memberIdNo: '',
                        memberIsMalaysian: '',
                        //memberGender: this.policyHolderGender,
                        memberGender: '',
                        memberRelationship: '',
                        driverRelationship: '',
                        //memberDOB: moment(this.policyHolderDob).format('DD/MM/YYYY'),
                        memberDOB: '',
                        memberMotorDrivingExperience: '',
                        memberOccupation: '',
                        memberPetBreed: '',
                        memberPetMicrochipId: '',
                        memberPhoto: '',

                       

                        basicPremium: this.formData['2'].basePremium, //
                        ncdAmount: '',
                        netNcdAmount: '',
                        annualPremium: '',
                        excess: '',
                        sst: '',
                        sstVal: '',
                        
                        discount: this.formData['2'].discountAmount, //
                        
                        stampDuty: this.formData['2'].stampDuty,//
                        grandTotal: this.formData['2'].totalPayable, //
                    },
                    success: function (data) {
                        //console.log("data obtained from initiatePayment");
                        //console.log(data)
                        //window.location.href = "http://localhost:8080/miniPA-payment.html?action=processPurchase&actionType=Step1";
                    }
                })
                .promise()
        },

         
        /* jw - mini PA end */
        createDotCMSQueryURL,
        findCountryByCode(code) {
            if (!this.countries) return ''
            return this.countries.find(c => c.code === code)
        },

        saveSession() {
            const state = {
                canProceed: this.canProceed,
                steps: this.steps,
                currStep: this.currStep,
                formData: this.formData,
                postcodeSearch: this.postcodeSearch,
                postcodeSuggestions: this.postcodeSuggestions,
                currSelectedPostcode: this.currSelectedPostcode,
                loanProviderSuggestions: this.loanProviderSuggestions,
            }
            window.sessionStorage.setItem('m3pa_data', JSON.stringify(state));
        },
        async maybeRestoreSession() {
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
                        this.canProceed = state.canProceed;
                        this.steps = state.steps;
                        this.currStep = activeStep;
                        this.formData = state.formData;
                        this.postcodeSearch = state.postcodeSearch;
                        this.postcodeSuggestions = state.postcodeSuggestions;
                        this.currSelectedPostcode = state.currSelectedPostcode;
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
        customDateFormatter: function customDateFormatter(){
            return moment().format('DD/MM/YYYY');
        },
        customDateFormatterWithDay: function customDateFormatterWithDay(){
            return moment().format('DD/MM/YYYY (ddd)');
        },
        scrollTop() {
            return new Promise((resolve, reject) => {
                const offset = $("#miniPA-form").offset().top;
                if (window.scrollY < 100) {
                    return resolve()
                }
                scrollTo(offset).then(() => resolve())
            })
        },
        resetForm: function() {
            this.steps
                .filter(step => !['1'].includes(step.stepNum))
                .forEach(step => step.completed = false)

            this.postcodeSearch = '';
            this.postcodeSuggestions = [];
            this.currSelectedPostcode = '';
            this.isNotKnownPostcode = false;

            this.formData['2'] = {
                // jw - miniPA
                coverageStartDate: '',
                coverageEndDate:'',
                dateSelected: false,
                daysOfCoverage: '365',
                
                planSelected: false,
                planName:'',
                basePremium:'0',
                planAccidentalDeathPermanentDisablement:'',
                planBereavementAllowance:'',
                discountAmount:'0',
                planCode:'',
                discountRate: getInputValueOrEmpty("discountRate"),
                serviceTaxRate: getInputValueOrEmpty("serviceTaxRate"),             

                subTotal:'',
                serviceTax:'',
                stampDuty:'0.00',

                totalPayable:''
            }

            this.formData['3'] = {
                 // jw - mini PA
                 policyHolderName:'',
                 policyHolderEmail:'',
                 policyHolderMobileNo:'',
                 policyHolderAddressLine1:'',
                 policyHolderAddressLine2:'',
                 addressPostcode:'',
                 addressCity:'',
                 addressState:'',
                 addressStateCode: '',
 
                 // extra for foreigner
                 policyHolderCountry:'',
                 policyHolderGender:'',
                 policyHolderDateOfBirth:'',
            }

            this.formData['4'] = {
                // jw mini PA
                tncAgreement: "",
                isRiderDetailsEditMode: false,
                //purchaseTempId: '',

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

                // extra for foreigner
                policyHolderCountry:'',
                policyHolderGender:'',
                policyHolderDateOfBirth:'',

                purchaseTempId:''
            }

            // wj - FPX hide
            if ((Date.now() > new Date('2020-09-12 03:00:00') && Date.now() < new Date('2020-09-12 08:00:00')) || (Date.now() > new Date('2020-09-26 03:00:00') && Date.now() < new Date('2020-09-26 08:00:00'))) {
                this.formData['5'] = {
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

                 if (this.copyOfNricOrPassport !== this.formData['1'].policyHolderNric) {
                    this.resetForm();
                    this.formData['3'].policyHolderCountry = this.formData['1'].policyHolderCountry;       
                }
                if(this.formData['1'].policyHolderIdType !== 'nric'){
                    this.formData['3'].policyHolderDateOfBirth = this.formData['1'].policyHolderDateOfBirth;
                }

                 this.checkNric();
                this.resetPagination();
                this.updatePolicyHolderGender();



            } else if (this.currStep.stepNum == '2') {
                this.updateDateOfBirth();

                // check purchase twice or renwal here
                var minipaPolicyPurchaseTwiceOrRenewal = JSON.parse(await this.minipaPolicyPurchaseTwiceOrRenewal());
                if(minipaPolicyPurchaseTwiceOrRenewal.canProceed == "false"){ // purchase twice liao
                    this.errorMessage = "It looks like you've already purchased a similar plan from us.";
                    this.loading = false;
                    this.canProceed = false;
                    sessionStorage.removeItem('m3pa_data');
                    return;
                }

            } else if (this.currStep.stepNum == '3') {
                this.formData['4'].policyHolderName = this.formData['3'].policyHolderName;
                this.formData['4'].policyHolderEmail = this.formData['3'].policyHolderEmail;
                this.formData['4'].policyHolderMobileNo = this.formData['3'].policyHolderMobileNo;
                this.formData['4'].policyHolderAddressLine1 = this.formData['3'].policyHolderAddressLine1;
                this.formData['4'].policyHolderAddressLine2 = this.formData['3'].policyHolderAddressLine2;
                this.formData['4'].addressPostcode = this.formData['3'].addressPostcode;
                this.formData['4'].addressState = this.formData['3'].addressState;
                this.formData['4'].addressStateCode = this.formData['3'].addressStateCode;
                this.formData['4'].addressCity = this.formData['3'].addressCity;
                
                this.formData['4'].policyHolderGender = this.formData['3'].policyHolderGender;
                if (!this.isIdNric){
                // extra for foreigner
                this.formData['4'].policyHolderCountry = this.formData['3'].policyHolderCountry;
                //new Date(moment(this.formData['3'].policyHolderDateOfBirth).format('DD/MM/YYYY'));
                this.formData['4'].policyHolderDateOfBirth = this.formData['3'].policyHolderDateOfBirth;
                this.formData['1'].policyHolderCountry = this.formData['3'].policyHolderCountry;
                
                }

                window.killUnloadM3PA && window.killUnloadM3PA()
                this.currStep.completed = true;
                this.saveSession();
                // no need purchase yet for mini PA
                this.processPurchaseStep1();
                await this.scrollTop();
                return;

            } else if (this.currStep.stepNum == '4') {
                //window.location.href = "http://localhost:8080/miniPA-payment.html?action=processPurchase&actionType=Step1";// tempo uncomment
                const response = await this.initiatePayment();                
                const $errorFormWrapper = $(`<div id="error-form-wrapper">${response}</div>`);                

                if ($($errorFormWrapper).find('form').length == 0){
                    let tempError = $($errorFormWrapper).find('li').html();
                    if(tempError){
                        let startSlice = tempError.indexOf('.')+1;
                        this.errorMessage = tempError.substr(tempError.indexOf('.')+1, tempError.length-(startSlice+3));
                    }
                    this.canProceed = false;
                    sessionStorage.removeItem('m3pa_data');
                    return;
                }

                $errorFormWrapper.find('form').attr('action', this.paymentUrl);
                $(this.$el).find('#error-form-placeholder').html($errorFormWrapper.html());
                this.formData['4'].purchaseTempId = $errorFormWrapper.find('input[name="purchaseTempId"]').val();                

                window.killUnloadM3PA && window.killUnloadM3PA()
                this.currStep.completed = true;
                this.saveSession();
                await this.scrollTop();
                $(this.$el).find('#error-form-placeholder form').trigger('submit')
                return;
            } else if (this.currStep.stepNum == '5') {
                window.killUnloadM3PA && window.killUnloadM3PA()
                $('form#thePaymentForm').trigger('submit');
                this.saveSession();
                return;
            }

            await this.scrollTop();

            this.currStep.completed = true;
            this.currStep = this.steps[this.steps.indexOf(this.currStep) + 1];
            window.location.hash = this.currStep.hash;

            this.loading = false;
            this.initializeTooltips()
            this.$nextTick(() => this.rowMatchHeight())
            this.$nextTick(() => this.initializeSwiper())
            this.saveSession()
        },
        goToPrevStep: async function () {
            if (this.steps.indexOf(this.currStep) == 0) {
                return;
            }

            this.loading = true;

            if (this.currStep.stepNum == '2') {
                this.copyOfNricOrPassport = this.formData['1'].policyHolderNric;
                this.copyOfVehicleRegNum = this.formData['1'].motorRegistrationNo;
            }else if(this.currStep.stepNum == '3'){
                this.resetPagination();

            }

            if (this.currStep.stepNum == '4' && !['registration', 'payment'].includes(this.stage)) {
                await this.scrollTop();
                window.killUnloadM3PA && window.killUnloadM3PA()
                this.currStep = this.steps[this.steps.indexOf(this.currStep) - 1];
                this.currStep.completed = false;
                this.saveSession();
                window.location.href = this.registrationUrl + '#fillindetails';
                return;
            }

            if (this.currStep.stepNum == '5' && !['registration', 'summary'].includes(this.stage)) {
                await this.scrollTop();
                window.killUnloadM3PA && window.killUnloadM3PA()
                this.currStep = this.steps[this.steps.indexOf(this.currStep) - 1];
                this.currStep.completed = false;
                this.saveSession();
                window.location.href = this.summaryUrl;
                return;
            }

            
            this.currStep = this.steps[this.steps.indexOf(this.currStep) - 1];
            this.currStep.completed = false;

            this.saveSession()
            await this.scrollTop();
            window.location.hash = this.currStep.hash;
            
            this.initializeTooltips()
            this.loading = false;
            this.$nextTick(() => this.rowMatchHeight())            
            this.$nextTick(() => this.initializeSwiper())
        },

        /**
         * Returns a list of models produced by a make (e.g. Yamaha).
         * @param {string} motorMakeCode 
         */
        /**
         * Returns a list of cubic capacity for a particular model.
         * @param {string} motorMakeCode 
         * @param {string} motorModelCode 
         * @param {string} motorYearOfMake 
         * @param {string} coverageStartDate 
         */
         /**
         * Returns a list of model variants for a particular model of motorcycle.
         */

      
        /**
         * Used in template to handle a change in the Cubic Capacity's field's value
         */
          /**
         * Used in template to handle a change in the variant of the motorcycle
         */

         getPostcodesAsync: async function(postcode) {
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
        getLoanProvidersAsync: async function(name) {
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
        handlePostcodeHit: async function (cityObj) {
            console.log("hi");
            this.formData[this.currStep.stepNum].addressPostcode = cityObj.postcode;
            this.formData[this.currStep.stepNum].addressCity = cityObj.cityDescription;

            const stateQuery = {
                'stateCode': cityObj.stateCode
            }
            const dotCMSQueryURL = this.createDotCMSQueryURL('TieRefState', stateQuery, true)
            const stateApiResp = await $.ajax({
                method: 'GET',
                dataType: 'json',
                url: dotCMSQueryURL
            }).promise()

            this.formData[this.currStep.stepNum].addressState = stateApiResp.contentlets[0].stateDescription;
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
        formatAsCurrency: function(number) {
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

        cancelEditRiderDetails: function () {
            this.formData['4'].policyHolderName = this.formData['3'].policyHolderName;
            this.formData['4'].policyHolderEmail = this.formData['3'].policyHolderEmail;
            this.formData['4'].policyHolderMobileNo = this.formData['3'].policyHolderMobileNo;
            this.formData['4'].policyHolderAddressLine1 = this.formData['3'].policyHolderAddressLine1;
            this.formData['4'].policyHolderAddressLine2 = this.formData['3'].policyHolderAddressLine2;
            this.formData['4'].addressPostcode = this.formData['3'].addressPostcode;
            this.formData['4'].addressState = this.formData['3'].addressState;
            this.formData['4'].addressStateCode = this.formData['3'].addressStateCode;
            this.formData['4'].addressCity = this.formData['3'].addressCity;
             if (!this.isIdNric) {
            // extra for foreigner
            this.formData['4'].policyHolderCountry = this.formData['3'].policyHolderCountry;
            this.formData['4'].policyHolderGender = this.formData['3'].policyHolderGender;
            this.formData['4'].policyHolderDateOfBirth = this.formData['3'].policyHolderDateOfBirth;
            }

           
            this.formData['4'].isRiderDetailsEditMode = false;
            $(".summaryBack").removeClass("disabled");
            $(".summaryCheckout").removeClass("disabled");

        },
        saveEditRiderDetails: async function () {
            const isValid = await this.$refs.editRiderObserver.validate();
            if (!isValid) {
                this.scrollToError()
                return
            };

            this.formData['3'].policyHolderName = this.formData['4'].policyHolderName;
            this.formData['3'].policyHolderEmail = this.formData['4'].policyHolderEmail;
            this.formData['3'].policyHolderMobileNo = this.formData['4'].policyHolderMobileNo;
            this.formData['3'].policyHolderAddressLine1 = this.formData['4'].policyHolderAddressLine1;
            this.formData['3'].policyHolderAddressLine2 = this.formData['4'].policyHolderAddressLine2;
            this.formData['3'].addressPostcode = this.formData['4'].addressPostcode;
            this.formData['3'].addressState = this.formData['4'].addressState;
            this.formData['3'].addressStateCode = this.formData['4'].addressStateCode;
            this.formData['3'].addressCity = this.formData['4'].addressCity;
           
            // extra for foreigner
            this.formData['3'].policyHolderCountry = this.formData['4'].policyHolderCountry;
            this.formData['3'].policyHolderGender = this.formData['4'].policyHolderGender;
            this.formData['3'].policyHolderDateOfBirth = this.formData['4'].policyHolderDateOfBirth;

           
            this.formData['4'].isRiderDetailsEditMode = false;
            $(".summaryBack").removeClass("disabled");
            $(".summaryCheckout").removeClass("disabled");

        },
        processPurchaseStep1: function () {
            const $form = $(this.$el).find('form#summary-form-placeholder');
            $form.attr('action', this.summaryUrl);
            $form.attr('method', 'post'); // temporary comment
            const data = {
                action: "processPurchase",
                actionType: "Step1",
                partnerCode: this.partnerCode,
                productCode: this.productCode,
                productName: this.productName,
                productGroup: this.productGroup,
                prefixMobile: this.prefixMobile,
                formula: 'mini-personal-accident',
                certificateNo: this.certificateNo,
               
                staffId: this.staffId,
                staffRelationship: this.staffRelationship,
                policyStartDate: '',
                policyEndDate: '',
                policyStartDate: '',
                policyEndDate: '',
                coverageStartDate: this.formData['2'].formattedCoverageStartDate,
                coverageExpiryDate: this.formData['2'].formattedCoverageEndDate,
                coveragePlan: this.formData['2'].planCode,
                coveragePremiumRate: this.coveragePremiumRate,
                coveragePremiumDiscount: this.formData['2'].discountAmount,
                coverageStampDuty: this.formData['2'].stampDuty,
                totalPremium: this.formData['2'].totalPayable,
                minimumCoverage: 1,
                totalPersonToCalc: 1,
                noDaysCovered: this.formData['2'].daysOfCoverage,
                productMinAge: 16,
                productMaxAge: 65,
                refAddress1: '',
                refAddress2: '',
                addressOverwriteIndicator: '',
                isInIframe: this.isInIframe,
                prescreenYesNo: 'Y',
               
                privacyNoticeCheckbox: 'Y', // to check if needed
               
                dpfStatus: '',
               
                policyHolderNationality: this.formData['1'].policyHolderCountry ? this.formData['1'].policyHolderCountry : 'MAL',
                
               
                policyHolderMalaysian: this.isIdNric ? 'Y' : 'N',
                policyHolderName: this.formData['3'].policyHolderName,
                policyHolderNRIC: this.isIdNric ? this.formData['1'].policyHolderNric : '',
                policyHolderPassport: this.isIdNric ? '' : this.formData['1'].policyHolderNric,
                policyHolderGender: this.policyHolderGender,
                policyHolderDateOfBirth: moment(this.policyHolderDob).format('DD/MM/YYYY'),
                policyHolderEmail: this.formData['3'].policyHolderEmail,
                policyHolderMobileNo: this.formData['3'].policyHolderMobileNo,
                policyHolderAddressLine1: this.formData['3'].policyHolderAddressLine1,
                policyHolderAddressLine2: this.formData['3'].policyHolderAddressLine2,
                addressPostcode: this.formData['3'].addressPostcode,
                addressState: this.postcodeSuggestions.find(a => a.cityDescription === this.formData['3'].addressCity).stateCode,
                addressCity: this.postcodeSuggestions.find(a => a.cityDescription === this.formData['3'].addressCity).cityCode,
                policyHolderMaritalStatus: '',
                policyHolderOccupation: '',              
               
               
                basicPremium: this.formData['2'].basePremium,
                discount: this.formData['2'].discountAmount,
                sst: this.formData['2'].sst,
                sstVal: this.formData['2'].serviceTax,
                stampDuty: this.formData['2'].stampDuty,
                grandTotal: this.formData['2'].totalPayable,
                additionalPremium: '',
               
                memberName: '',
                memberCountry: '',
                memberIdNo: '',
                memberRelationship: '',
                memberDOB: '',
                memberMotorDrivingExperience: '',
                memberIsMalaysian: '',
                memberIsMalaysian:'',
                memberOccupation: '',
                memberGender: '',

            };
            $form.append(
                Object
                    .keys(data)
                    .map(key => $(`<input type="hidden" name="${key}" value="${data[key]}">`))
            )
            $form.trigger('submit', data)
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
        async getBankList() {
            const data = await $.ajax({
                method: 'GET',
                url: this.baseUrl + '/dotCMS/purchase/paynow/banklist',
                dataType: 'json'
            })
            //this.banks = data.filter(b => b.bankOnlineStatus === true);
            console.log(data);
            this.banks = Array.isArray(data) ? data.filter(b => b.bankOnlineStatus === true) : []
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
       
        showTncModal() {
            $(this.$el).find('#tnc-modal').modal('show')
        },
    },
    computed: {
        displayDateFormat: function(){
            return moment(this.formData['3'].policyHolderDateOfBirth).format('DD/MM/YYYY')
        },
        step4PassportOrNric:function(){
            if(this.formData['1'].policyHolderIdType == 'nric'){
                return 'NRIC';
            }
            else{
                return 'Passport';
            }
        },
        isIdNric: function () {
            return this.formData['1'].policyHolderIdType === 'nric';
        },
        policyHolderGender: {
            cache: false,
            get() {
                if (!this.isIdNric) {
                    return this.formData['3'].policyHolderGender || ''
                }
                if (this.isIdNric) {
                    const last4Digits = this.formData['1'].policyHolderNric.split('-')[2]
                    return last4Digits % 2 === 1 ? 'M' : 'F'
                }
            },
            set(value) {
                this.formData['3'].policyHolderGender = value
            }
        },
        policyHolderDob: {
            get() {
                if (this.isIdNric) {
                    const nric = this.formData['1'].policyHolderNric;
                    return extractDOB(nric);
                }else{
                return this.formData['1'].policyHolderDateOfBirth;
                }
            },
            set(value) {
                this.formData['3'].policyHolderDateOfBirth = value;
            }
        },
        fullAddress: function () {
            if (this.formData['3'].policyHolderAddressLine2 == ""){
                return `${this.formData['3'].policyHolderAddressLine1}, ${this.formData['3'].addressPostcode} ${this.formData['3'].addressCity}, ${this.formData['3'].addressState}`

            }else
            return `${this.formData['3'].policyHolderAddressLine1}, ${this.formData['3'].policyHolderAddressLine2}, ${this.formData['3'].addressPostcode} ${this.formData['3'].addressCity}, ${this.formData['3'].addressState}`
        },
        cardType: function () {
            return getCardType(this.formData['5'].ccNo)
        },
      
        mobileNumber: function () {
            return this.formData['3'].policyHolderMobileNo.replace(/\s/g, '')
        },
        openPolicyDate: function(){
            var date = new Date();
            date = new Date (date.getFullYear(), date.getMonth(), date.getDate()+1 );
			return date;
        },
        disabledPolicyDates: function(){
            var date = new Date();
            var dateTmr = new Date();
            date = new Date (date.getFullYear(), date.getMonth() + 6, date.getDate());
            dateTmr = new Date (dateTmr.getFullYear(), dateTmr.getMonth(), dateTmr.getDate() +1);
            return {to: new Date(dateTmr.getFullYear(), dateTmr.getMonth(), dateTmr.getDate()), from: new Date (date.getFullYear(), date.getMonth(), date.getDate())}
        },
       
    },
    watch: {
        "formData.1.policyHolderNric":function(e){
            var t = this.formData['1'].policyHolderNric;
            this.formData['1'].policyHolderNric = t.toUpperCase();
        },
        "formData.3.addressPostcode": _.debounce(async function (postcode) {
            if (postcode == undefined){
                postcode = '';
            }
            await this.getPostcodesAsync(postcode)

            if (postcode.length === 5 && this.currSelectedPostcode && this.currSelectedPostcode.postcode != postcode) {
                this.currSelectedPostcode = null;
            }

            if (postcode.length === 5 && !this.currSelectedPostcode) {
                let suggestion = this.postcodeSuggestions.find(s => s.postcode == postcode);
                if (!suggestion) {
                    this.isNotKnownPostcode = true;
                    return;
                }

                this.formData['3'].addressCity = suggestion.cityDescription;
                this.formData['3'].addressState = this.states.find(s => s.code === suggestion.stateCode).name;
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
                    this.isNotKnownPostcode = true;
                    return;
                }
                this.formData['4'].addressCity = suggestion.cityDescription;
                this.formData['4'].addressState = this.states.find(s => s.code === suggestion.stateCode).name;
                this.isNotKnownPostcode = false;
                return;
            }
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
        window.addEventListener('resize',this.getWindowWidth);
        this.getCountries()
        this.getMalaysiaStates()
        this.getBankList()
        await this.maybeRestoreSession()
        this.initializeTooltips()
        this.$nextTick(()=>{
            this.initializeSwiper()
        });
        
               
        this.loading = false;
    }
})