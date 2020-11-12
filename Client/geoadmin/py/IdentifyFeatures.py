# -*- coding: utf-8 -*-
# -------------------------------------------------------------------------------------------------
# -- IdentifyFeatures.py
#    Encapusaltes IdentifyFeatures REST-API from API3 geo.admin.ch
# -- Author: flu, 09.11.2020
# -- commandline:
# -------------------------------------------------------------------------------------------------
# -- History
# -------------------------------------------------------------------------------------------------

import json
import re
import requests
import urllib

class IdentifyFeatures:
    """
    Shows how to get a json from https://api3.geo.admin.ch/rest/services/api/MapServer/identify
    Needs a point coordinate and a distance. The distance ist needed to caluculate a square with
    a side length twice the distance an the point in the center. This square is used as a
    intersecting envelope geometry with no buffer

    Attributes:
        point:    Where to identify, coordinate pair. First value ist east second is
                  north in LV95 (EPSG code 2056). Default is (2600000.000,1200000.000)
        distance: half length of the square in meter. Default = 0.0
        layers:   comma separated list of technical layer names like
                  ch.swisstopo.pixelkarte-pk25.metadata
    """

    def __init__(
        self,
        pt=(2600000.000, 1200000.000),
        distance=0.0,
        layers="ch.swisstopo.pixelkarte-pk25.metadata",
    ):
        """ Inits IdentifyFeatures

        sets the attributes
        """
        self.__pt = pt
        self.__distance = distance
        self.__layers = layers
        try:
            self.__envelope = (
                str(pt[0] - distance)
                + ","
                + str(pt[1] - distance)
                + ","
                + str(pt[0] + distance)
                + ","
                + str(pt[1] + distance)
            )
        except Exception as e:
            raise e
        self.__url = "https://api3.geo.admin.ch/rest/services/api/MapServer/identify"
        self.__params = {}
        self.__params["geometryType"] = "esriGeometryEnvelope"
        self.__params["geometry"] = self.__envelope
        self.__params["imageDisplay"] = "0,0,0"
        self.__params["mapExtent"] = "0,0,0,0"
        self.__params["tolerance"] = "0"
        self.__params["layers"] = "all:" + layers
        self.__params["returnGeometry"] = "false"
        self.__params["sr"] = 2056

    @property
    def getpt(self):
        return self.__pt

    @property
    def getpt_east(self):
        return self.__pt[0]

    @property
    def getpt_north(self):
        return self.__pt[1]

    @property
    def getdistance(self):
        return self.__distance

    @property
    def getlayers(self):
        return self.__layers

    @property
    def getlayerlist(self):
        return list(self.__layers.split(","))

    @property
    def getenvelope(self):
        return self.__envelope

    @property
    def __getproxy(self):
        _proxy = "proxy.admin.ch:8080"
        return {"http": _proxy, "https": _proxy}

    def getjson(self):
        _proxy = "proxy.admin.ch:8080"
        _proxy_dict = {"http": _proxy, "https": _proxy}
        _req = requests.get(
            url=self.__url, proxies=_proxy_dict, params=self.__params, verify=False
        )
        return _req.status_code, json.loads(_req.content)


    def __query_bezirk_kanton(self, bfsnummer=0):
        _params = {}
        _params["where"] = urllib.parse.quote("BFS_NUMMER={0}".format(bfsnummer))
        _params["where"] = urllib.parse.quote("BFS_NUMMER={0}".format(bfsnummer))
        _params["outFields"] = urllib.parse.quote("BEZIRKSNUMMER,KANTONSNUMMER")
        _params["returnGeometry"] = "false"
        _params["f"] = "json"
        _url = "https://s7t2530a.adr.admin.ch/arcgis/rest/services/PRODAS/PolitischeEinteilung/FeatureServer/3/query"
        _req = requests.get(
            url=_url, proxies={}, params=_params, verify=False
        )
        if _req.status_code == 200:
            _json = json.loads(_req.content)
            print(_json)
        #https: // s7t2530a.adr.admin.ch / arcgis / rest / services / PRODAS / PolitischeEinteilung / FeatureServer / 3 / query?where = BFS_NUMMER + % 3
        #D + 733 & objectIds = & time = & geometry = & geometryType = esriGeometryEnvelope & inSR = & spatialRel = esriSpatialRelIntersects & distance = & units = esriSRUnit_Foot & relationParam = & outFields = BEZIRKSNUMMER % 2
        #CKANTONSNUMMER + & returnGeometry = false & maxAllowableOffset = & geometryPrecision = & outSR = & havingClause = & gdbVersion = & historicMoment = & returnDistinctValues = false & returnIdsOnly = false & returnCountOnly = false & returnExtentOnly = false & orderByFields = & groupByFieldsForStatistics = & outStatistics = & returnZ = false & returnM = false & multipatchOption = xyFootprint & resultOffset = & resultRecordCount = & returnTrueCurves = false & returnExceededLimitFeatures = false & quantizationParameters = & returnCentroid = false & sqlFormat = none & resultType = & featureEncoding = esriDefault & datumTransformation = & f = html


    def __find_gde_bfsnr(self, gde=""):
        _params = {}
        _url = "http://api3.geo.admin.ch/rest/services/api/MapServer/find?layer=ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill&searchText={0}&searchField=gemname&returnGeometry=false".format(urllib.parse.quote(gde))
        _req = requests.get(
            url=_url, proxies=self.__getproxy, params=_params, verify=False
        )
        if _req.status_code == 200:
            _json = json.loads(_req.content)
            _results = _json["results"]
            if len(_results) == 1:
                return True, _results[0]["id"]
            else:
                return False, "gemname not found"
        else:
            return False, _req.content


    def __search_location(self,location):
        _params = {}
        _url = "https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText={0}&type=locations".format(location)
        _req = requests.get(
            url=_url, proxies=self.__getproxy, params=_params, verify=False
        )
        if _req.status_code == 200:
            _json = json.loads(_req.content)
            _results = _json["results"]
            if len(_results) == 1:
                _clean = re.compile('<.*?>')
                return True, re.sub(_clean, '', _results[0]["attrs"]["label"].split(" ")[0])
            else:
                return False, "egris_egrid not found"
        else:
            return False, _req.content


    def getparzinfo(self, distance=None):
        """
        get info from Parzelle, Gemeinde, Bezirk, Kanton
        :param distance: overrools the parameter set when initializing the class
        :return:
        """
        _envelope = ""
        if distance is None:
            _envelope = str(self.getpt_east - self.getdistance) + "," + str(self.getpt_north - self.getdistance) + "," + str(self.getpt_east +  self.getdistance) + "," + str(self.getpt_north +  self.getdistance)
        else:
            _envelope = str(self.getpt_east - distance) + "," + str(
                self.getpt_north - distance) + "," + str(
                self.getpt_east + distance) + "," + str(self.getpt_north + distance)
        _params = {}
        _params["geometryType"] = "esriGeometryEnvelope"
        _params["geometry"] = _envelope
        _params["imageDisplay"] = "0,0,0"
        _params["mapExtent"] = "0,0,0,0"
        _params["tolerance"] = "0"
        _params["layers"] = "all:" + "ch.kantone.cadastralwebmap-farbe"
        _params["returnGeometry"] = "false"
        _params["sr"] = 2056
        _req = requests.get(
            url=self.__url, proxies=self.__getproxy, params=_params, verify=False
        )
        if _req.status_code == 200:
            _json = json.loads(_req.content)
            for _key, _val in _json.items():
                for _featureid in _val:
                    print(_featureid)
                    for _attrkey, _attrval in _featureid["attributes"].items():
                        if _attrkey == "egris_egrid":
                            #print("egris_egrid: {0}".format(_attrval))
                            _found, _gde = self.__search_location(_attrval)
                            if _found:
                                print(_featureid["attributes"]["number"])
                                print(_featureid["attributes"]["egris_egrid"])
                                print(_gde)
                                _found, _gdeinfo = self.__find_gde_bfsnr(_gde)
                                if _found:
                                    print(_gdeinfo)
                                    self.__query_bezirk_kanton(733)

        else:
            return _req.status_code, json.loads(_req.content)
