/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const NATURAL_FEATURES_ERROR = 'NATURAL_FEATURES_ERROR';
const NATURAL_FEATURES_LOADING = 'NATURAL_FEATURES_LOADING';
const NATURAL_FEATURES_LOADED = 'NATURAL_FEATURES_LOADED';
const GET_ANIMALS = 'GET_ANIMALS';
const GET_PLANTS = 'GET_PLANTS';
const GET_FUNGUS = 'GET_FUNGUS';
const GET_NATURAL_AREAS = 'GET_NATURAL_AREAS';
const GET_SLIME_MOLDS = 'GET_SLIME_MOLDS';
const NATURAL_FEATURE_SELECTED = 'NATURAL_FEATURE_TYPE_SELECTED';
const NATURAL_FEATURE_ERROR = 'NATURAL_FEATURE_ERROR';
const NATURAL_FEATURE_LOADED = 'NATURAL_FEATURE_LOADED';
const UPDATE_NATURAL_FEATURE_FORM = 'UPDATE_NATURAL_FEATURE_FORM';
const UPDATE_SPECIES_FORMS = 'UPDATE_SPECIES_FORMS';
const GET_NATURAL_FEATURE_TYPE = 'GET_NATURAL_FEATURE_TYPE';
const NATURAL_FEATURE_TYPE_LOADED = 'NATURAL_FEATURE_TYPE_LOADED';
const NATURAL_FEATURE_ADDED = 'NATURAL_FEATURE_ADDED';
const NATURAL_FEATURE_TYPE_ERROR = 'NATURAL_FEATURE_TYPE_ERROR';
const UPDATE_NATURAL_FEATURE = 'UPDATE_NATURAL_FEATURE';
const SAVE_NATURAL_FEATURE = 'SAVE_NATURAL_FEATURE';
const DELETE_NATURAL_FEATURE = 'DELETE_NATURAL_FEATURE';
const NATURAL_FEATURE_MARKER_ADDED = 'NATURAL_FEATURE_MARKER_ADDED';
const NATURAL_FEATURE_POLYGON_ADDED = 'NATURAL_FEATURE_POLYGON_ADDED';
const UPDATE_NATURAL_FEATURE_ERROR = 'UPDATE_NATURAL_FEATURE_ERROR';
const NFD_LOGIN_SUCCESS = 'NFD_LOGIN_SUCCESS';
const USER_NOT_AUTHENTICATED_ERROR = 'USER_NOT_AUTHENTICATED_ERROR';

const Api = require('../api/naturalfeaturesdata');
const {setControlProperty} = require('../../MapStore2/web/client/actions/controls');
const {changeDrawingStatus} = require('../../MapStore2/web/client/actions/draw');
const {changeLayerProperties} = require('../../MapStore2/web/client/actions/layers');
const {loginFail, logout} = require('../../MapStore2/web/client/actions/security');
const {loadMaps} = require('../../MapStore2/web/client/actions/maps');
const assign = require('object-assign');
const ConfigUtils = require('../../MapStore2/web/client/utils/ConfigUtils');

const normalizeInfo = (resp) => {
    return resp;
};

const createEmptyFormValues = (featureType) => {
    const formvalues = {};
    featureType.map((section) => {
        section.formitems.map((item) => {
            formvalues[item.key] = null;
        });
    });
    return formvalues;
};

function naturalFeaturesError(error) {
    return {
        type: NATURAL_FEATURES_ERROR,
        error
    };
}

function naturalFeaturesLoading() {
    return {
        type: NATURAL_FEATURES_LOADING
    };
}

function naturalFeaturesLoaded(data, url) {
    return {
        type: NATURAL_FEATURES_LOADED,
        data,
        url
    };
}

function getAnimals(url) {
    return {
        type: GET_ANIMALS,
        url
    };
}

function getPlants(url) {
    return {
        type: GET_PLANTS,
        url
    };
}

function getFungus(url) {
    return {
        type: GET_FUNGUS,
        url
    };
}

function getNaturalAreas(url) {
    return {
        type: GET_NATURAL_AREAS,
        url
    };
}

function getSlimeMolds(url) {
    return {
        type: GET_SLIME_MOLDS,
        url
    };
}

function getNaturalFeatureType(url) {
    return {
        type: GET_NATURAL_FEATURE_TYPE,
        url
    };
}

function naturalFeatureTypeLoaded(forms, featuretype, featuresubtype, mode) {
    return {
        type: NATURAL_FEATURE_TYPE_LOADED,
        forms,
        featuretype,
        featuresubtype,
        mode
    };
}

function naturalFeatureTypeError(error) {
    return {
        type: NATURAL_FEATURE_TYPE_ERROR,
        error
    };
}

function updateNaturalFeatureForm(feature) {
    return {
        type: UPDATE_NATURAL_FEATURE_FORM,
        feature
    };
}

function updateSpeciesForms(feature) {
    return {
        type: UPDATE_SPECIES_FORMS,
        feature
    };
}

function userNotAuthenticatedError(error) {
    return {
        type: USER_NOT_AUTHENTICATED_ERROR,
        status: "error",
        error
    };
}

function reloadFeatureType(featuretype) {
    return (dispatch) => {
        if (featuretype === 'plant') {
            dispatch(getPlants('/nfdapi/layers/plant/'));
        } else if (featuretype === 'animal') {
            dispatch(getAnimals('/nfdapi/layers/animal/'));
        } else if (featuretype === 'fungus') {
            dispatch(getFungus('/nfdapi/layers/fungus/'));
        } else if (featuretype === 'slimemold') {
            dispatch(getSlimeMolds('/nfdapi/layers/slimemold/'));
        } else if (featuretype === 'naturalarea') {
            dispatch(getNaturalAreas('/nfdapi/layers/naturalarea/'));
        }
    };
}

function getFeatureInfo(properties, nfid) {
    return (dispatch) => {
        return Api.getFeatureInfo(properties.featuretype, nfid).then((resp) => {
            if (resp) {
                let feature = normalizeInfo(resp);
                dispatch(setControlProperty('addnaturalfeatures', 'enabled', false));
                dispatch(updateNaturalFeatureForm(feature));
                dispatch(setControlProperty('vieweditnaturalfeatures', 'enabled', true));
            }
        }).catch((error) => {
            if (error.status === 401) {
                return dispatch(userNotAuthenticatedError(error));
            }
            return dispatch(naturalFeatureTypeError('Error from REST SERVICE: ' + error.message));
        });
    };
}

function getSpecies(id) {
    return (dispatch) => {
        return Api.getSpecies(id).then((resp) => {
            if (resp) {
                dispatch(updateSpeciesForms(resp));
            }
        }).catch((error) => {
            if (error.status === 401) {
                return dispatch(userNotAuthenticatedError(error));
            }
            return dispatch(naturalFeatureTypeError('Error from REST SERVICE: ' + error.message));
        });
    };
}

function naturalFeatureSelected(properties, nfid, lflFeat) {
    let theLflFeat = lflFeat;
    return (dispatch) => {
        dispatch(changeDrawingStatus("clean", "Marker", "dockednaturalfeatures", [], {}));
        return Api.getFeatureSubtype(properties.featuresubtype).then((resp) => {
            if (resp.forms && resp.forms[0]) {
                dispatch(naturalFeatureTypeLoaded(resp.forms, resp.featuretype, resp.featuresubtype, "viewedit"));
                dispatch(getFeatureInfo(properties, nfid));
                dispatch(changeDrawingStatus("featureSelected", "Marker", "dockednaturalfeatures", [], {properties: properties, lflFeat: theLflFeat}));
            }
        }).catch((error) => {
            if (error.status === 401) {
                return dispatch(userNotAuthenticatedError(error));
            }
            return dispatch(naturalFeatureTypeError('Error from REST SERVICE: ' + error.message));
        });
    };
}

function naturalFeatureLoaded(feature) {
    return {
        type: NATURAL_FEATURE_LOADED,
        feature
    };
}

function naturalFeatureError(error) {
    return {
        type: NATURAL_FEATURE_ERROR,
        error
    };
}

function naturalFeatureAdded(error) {
    return {
        type: NATURAL_FEATURE_ADDED,
        error
    };
}


function activateFeatureInsert(properties) {
    return (dispatch) => {
        if (properties.featuretype === 'plant') {
            dispatch(changeDrawingStatus("start", "Marker", "dockednaturalfeatures", [], {properties: properties, icon: '../../assets/img/marker-icon-green-highlight.png'}));
        } else if (properties.featuretype === 'animal') {
            dispatch(changeDrawingStatus("start", "Marker", "dockednaturalfeatures", [], {properties: properties, icon: '../../assets/img/marker-icon-purple-highlight.png'}));
        } else if (properties.featuretype === 'fungus') {
            dispatch(changeDrawingStatus("start", "Marker", "dockednaturalfeatures", [], {properties: properties, icon: '../../assets/img/marker-icon-yellow-highlight.png'}));
        } else if (properties.featuretype === 'slimemold') {
            dispatch(changeDrawingStatus("start", "Marker", "dockednaturalfeatures", [], {properties: properties, icon: '../../assets/img/marker-icon-marine-highlight.png'}));
        } else if (properties.featuretype === 'naturalarea') {
            dispatch(changeDrawingStatus("start", "Marker", "dockednaturalfeatures", [], {properties: properties, icon: '../../assets/img/marker-icon-blue-highlight.png'}));
        }
    };
}

function naturalFeatureMarkerAdded(feature) {
    let newFeat = feature;
    let featuresubtype = newFeat.featuresubtype;
    return (dispatch) => {
        return Api.getFeatureSubtype(featuresubtype).then((response) => {
            if (response.forms && response.forms[0]) {
                dispatch(naturalFeatureTypeLoaded(response.forms, response.featuretype, response.featuresubtype, "add"));
                newFeat = assign(createEmptyFormValues(response.forms), newFeat);
                dispatch(updateNaturalFeatureForm(newFeat));
                dispatch(setControlProperty('addnaturalfeatures', 'enabled', true));
            }
        }).catch((error) => {
            if (error.status === 401) {
                return dispatch(userNotAuthenticatedError(error));
            }
            return dispatch(naturalFeatureTypeError('Error from REST SERVICE: ' + error.message));
        });
    };
}


function naturalFeaturePolygonAdded(geometry) {
    return {
        type: NATURAL_FEATURE_POLYGON_ADDED,
        geometry
    };
}

function saveNaturalFeatureLoading(feature) {
    return {
        type: SAVE_NATURAL_FEATURE,
        status: "loading",
        feature
    };
}

function saveNaturalFeatureSuccess(feature) {
    return {
        type: SAVE_NATURAL_FEATURE,
        status: "success",
        feature
    };
}

function saveNaturalFeatureError(feature, error) {
    return {
        type: SAVE_NATURAL_FEATURE,
        status: "error",
        feature,
        error
    };
}

function saveNaturalFeature(feature) {
    return (dispatch) => {
        if (feature) {
            dispatch(saveNaturalFeatureLoading(feature));
            return Api.saveNaturalFeature(feature).then((resp) => {
                dispatch(saveNaturalFeatureSuccess(resp));
            }).catch((error) => {
                if (error.status === 401) {
                    return dispatch(userNotAuthenticatedError(error));
                }
                return dispatch(saveNaturalFeatureError(feature, error));
            });
        }
    };
}

function updateNaturalFeatureLoading(id) {
    return {
        type: UPDATE_NATURAL_FEATURE,
        status: "loading",
        id
    };
}

function updateNaturalFeatureSuccess(id) {
    return {
        type: UPDATE_NATURAL_FEATURE,
        status: "success",
        id
    };
}

function updateNaturalFeatureError(id, error) {
    return {
        type: UPDATE_NATURAL_FEATURE_ERROR,
        status: "error",
        id,
        error
    };
}

function naturalFeatureCreated(featuretype, featuresubtype, feature) {
    return (dispatch) => {
        return Api.createNewFeature(feature).then((resp) => {
            if (resp) {
                dispatch(reloadFeatureType(resp.featuretype));
                dispatch(naturalFeatureCreated(resp.featuretype, resp.featuresubtype, resp.id));
                dispatch(changeDrawingStatus("clean", "Marker", "dockednaturalfeatures", [], {}));
                dispatch(setControlProperty('addnaturalfeatures', 'enabled', false));
            }
        }).catch((error) => {
            if (error.status === 401) {
                return dispatch(userNotAuthenticatedError(error));
            }
            return dispatch(updateNaturalFeatureError(-1, error));
        });
    };
}


function updateNaturalFeature(featuretype, featuresubtype, properties) {
    return (dispatch) => {
        // dispatch(updateNaturalFeatureLoading(feature));
        return Api.updateNaturalFeature(featuretype, properties).then(() => {
            dispatch(updateNaturalFeatureSuccess(properties.id));
            dispatch(reloadFeatureType(featuretype));
            dispatch(setControlProperty('vieweditnaturalfeatures', 'enabled', false));
        }).catch((error) => {
            if (error.status === 401) {
                return dispatch(userNotAuthenticatedError(error));
            }
            return dispatch(updateNaturalFeatureError(properties.id, error));
        });
    };
}

function deleteNaturalFeatureLoading(feature) {
    return {
        type: DELETE_NATURAL_FEATURE,
        status: "loading",
        feature
    };
}

function deleteNaturalFeatureSuccess(id) {
    return {
        type: DELETE_NATURAL_FEATURE,
        status: "success",
        id
    };
}

function deleteNaturalFeatureError(id, error) {
    return {
        type: DELETE_NATURAL_FEATURE,
        status: "error",
        id,
        error
    };
}

function deleteNaturalFeature(featuretype, id) {
    return (dispatch) => {
        return Api.deleteNaturalFeature(featuretype, id).then(() => {
            dispatch(changeLayerProperties(featuretype, {features: []}));
            dispatch(reloadFeatureType(featuretype));
            dispatch(setControlProperty('vieweditnaturalfeatures', 'enabled', false));
            dispatch(deleteNaturalFeatureSuccess(id));
        }).catch((error) => {
            if (error.status === 401) {
                return dispatch(userNotAuthenticatedError(error));
            }
            return dispatch(deleteNaturalFeatureError(id, error));
        });
    };
}

function getData() {
    return (dispatch) => {
        dispatch(getAnimals('/nfdapi/layers/animal/'));
        dispatch(getPlants('nfdapi/layers/plant/'));
        // dispatch(getNaturalAreas('/nfdapi/layers/naturalarea/'));
        dispatch(getFungus('/nfdapi/layers/fungus/'));
        dispatch(getSlimeMolds('/nfdapi/layers/slimemold/'));
    };
}

function loginSuccess(userDetails, username, password, authProvider) {
    sessionStorage.setItem('nfd-jwt-auth-token', userDetails.token);
    return {
        type: NFD_LOGIN_SUCCESS,
        userDetails: userDetails.user,
        username: userDetails.user.name,
        authProvider: authProvider
    };
}

function userLoginSubmit(username, password) {
    return (dispatch) => {
        Api.jwtLogin(username, password).then((response) => {
            dispatch(loginSuccess(response, username, password, "django-jwt"));
            dispatch(loadMaps(false, ConfigUtils.getDefaults().initialMapFilter || "*"));
        }).catch((e) => {
            dispatch(loginFail(e));
        });
    };
}

function showLogin() {
    return (dispatch) => {
        dispatch(setControlProperty('LoginForm', 'enabled', true));
    };
}

function nfdLogout() {
    sessionStorage.setItem('nfd-jwt-auth-token', null);
    return (dispatch) => {
        dispatch(logout(null));
        dispatch(changeLayerProperties("animal", {features: []}));
        dispatch(changeLayerProperties("fungus", {features: []}));
        dispatch(changeLayerProperties("plant", {features: []}));
        dispatch(changeLayerProperties("slimemold", {features: []}));
        dispatch(changeLayerProperties("naturalarea", {features: []}));
    };
}

function getVersion(featureType, featId, version) {
    return (dispatch) => {
        return Api.getVersion(featureType, featId, version).then((feature) => {
            if (feature) {
                // disptach(getVersionSuccess());
                dispatch(updateNaturalFeatureForm(feature));
            }
        }).catch((error) => {
            if (error.status === 401) {
                return dispatch(userNotAuthenticatedError(error));
            }
            // return dispatch(getVersionError(featureType, featId, error));
        });
    };
}

function nextVersion(featureType, featId, currentVersion) {
    return getVersion(featureType, featId, currentVersion + 1);
}

function previousVersion(featureType, featId, currentVersion) {
    return getVersion(featureType, featId, currentVersion - 1);
}


module.exports = {
    NATURAL_FEATURES_ERROR, naturalFeaturesError,
    NATURAL_FEATURES_LOADING, naturalFeaturesLoading,
    NATURAL_FEATURES_LOADED, naturalFeaturesLoaded,
    GET_ANIMALS, GET_PLANTS, GET_FUNGUS, GET_NATURAL_AREAS, GET_SLIME_MOLDS,
    getAnimals, getPlants, getFungus, getNaturalAreas, getSlimeMolds,
    NATURAL_FEATURE_SELECTED, naturalFeatureSelected,
    NATURAL_FEATURE_LOADED, naturalFeatureLoaded,
    NATURAL_FEATURE_ERROR, naturalFeatureError,
    UPDATE_NATURAL_FEATURE_FORM, updateNaturalFeatureForm,
    GET_NATURAL_FEATURE_TYPE, getNaturalFeatureType, reloadFeatureType,
    NATURAL_FEATURE_TYPE_LOADED, naturalFeatureTypeLoaded,
    NATURAL_FEATURE_TYPE_ERROR, naturalFeatureTypeError,
    naturalFeatureCreated, naturalFeatureAdded,
    SAVE_NATURAL_FEATURE, saveNaturalFeature,
    saveNaturalFeatureLoading, saveNaturalFeatureSuccess,
    saveNaturalFeatureError,
    UPDATE_NATURAL_FEATURE, updateNaturalFeature,
    updateNaturalFeatureLoading, updateNaturalFeatureSuccess,
    UPDATE_NATURAL_FEATURE_ERROR, updateNaturalFeatureError,
    DELETE_NATURAL_FEATURE, deleteNaturalFeature,
    deleteNaturalFeatureLoading, deleteNaturalFeatureSuccess,
    deleteNaturalFeatureError,
    NATURAL_FEATURE_MARKER_ADDED, naturalFeatureMarkerAdded,
    NATURAL_FEATURE_POLYGON_ADDED, naturalFeaturePolygonAdded,
    getSpecies,
    updateSpeciesForms, UPDATE_SPECIES_FORMS, activateFeatureInsert,
    userLoginSubmit, NFD_LOGIN_SUCCESS, nfdLogout, getData,
    USER_NOT_AUTHENTICATED_ERROR,
    showLogin,
    nextVersion, previousVersion
};
