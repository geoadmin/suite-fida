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
import os
import re
import sys

import requests
import requests.packages.urllib3.exceptions as r_ex


class IdentifyFeatures:
    """
    Shows how to get a json from https://api3.geo.admin.ch/rest/services/api/MapServer/identify
    Needs a point coordinate and a distance. The distance ist needed to caluculate a square with
    a side length twice the distance an the point in the center. This square is used as a
    intersecting envelope geometry with no buffer
    Needs a IdentifyFeatures.json. In this file there is a dictionary with 3 [T/I/P]config.
    Each config has the query rest endpoint to the tlm_hoheitsgebiet, url_tlm_bezirksgebiet,
    url_tlm_kantonsgebiet. These endpoints belong to ESRI Featureservices based on
    https://shop.swisstopo.admin.ch/en/products/landscape/boundaries3D

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
        _cfg = self.__get_settings()
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
        self.__url_api3_identify = (
            "https://api3.geo.admin.ch/rest/services/api/MapServer/identify"
        )
        self.__url_api3_find = (
            "https://api3.geo.admin.ch/rest/services/api/MapServer/find"
        )
        self.__url_api3_search_server = (
            "https://api3.geo.admin.ch/rest/services/api/SearchServer"
        )
        try:
            self.__url_tlm_hoheitsgebiet = _cfg["T"]["url_tlm_hoheitsgebiet"]
            self.__url_tlm_bezirksgebiet = _cfg["T"]["url_tlm_bezirksgebiet"]
            self.__url_tlm_kantonsgebiet = _cfg["T"]["url_tlm_kantonsgebiet"]
        except Exception as e:
            raise e
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

    def __get_settings(self):
        """ Reads the json file with configuration's for T|I and P
        Args:
            -
        Returns:
            dictionary with the settings
        Raises:
            JSONDecodeError: If the data being deserialized is not a valid JSON document.
            IOError: if the config json file file is missing
        """
        _setting_filename = os.path.join(
            os.path.dirname(sys.argv[0]), "IdentifyFeatures.json"
        )
        try:
            with open(_setting_filename, "r") as _myfile:
                _data = _myfile.read()
        except IOError:
            raise

        # parse file
        try:
            return json.loads(_data)
        except json.JSONDecodeError:
            raise
        except Exception:
            raise

    def getjson(self):
        """ gets the json from api3.geo.admin.ch identify
        Args:
            -
        Returns:
           json from api3.geo.admin.ch identify
        Raises:
            JSONDecodeError: If the data being deserialized is not a valid JSON document.
        """
        _proxy = "proxy.admin.ch:8080"
        _proxy_dict = {"http": _proxy, "https": _proxy}
        _req = requests.get(
            url=self.__url_api3_identify,
            proxies=_proxy_dict,
            params=self.__params,
            verify=False,
        )
        return _req.status_code, json.loads(_req.content)

    def __get_jsonfromurl(self, url, parameter):
        """ Gets a json from a ArcGISServerURL via a get with parameterlist
        Args:
            url: the url to call
            paramter: paramterd ictionary
        Returns:
            Json
        Raises:
            ConnectionError if there is no connction to the rest end point
        """
        requests.packages.urllib3.disable_warnings(r_ex.InsecureRequestWarning)
        session = requests.Session()
        session.trust_env = False
        try:
            req = session.get(
                url=url,
                params=parameter,
                auth=requests.auth.HTTPDigestAuth(os.environ["USERNAME"], False),
                verify=False,
            )
        except ConnectionError:
            raise ConnectionError(
                "Could not get connection to {0} with parameterset {1}".format(
                    url, str(parameter)
                )
            )
        except Exception:
            raise
        return req.json()

    def __query_kantons_name(self, kanotnid=0):
        """ Gets the name of the kanton from kantonsgebiet, if there is no kanton, enpty string
        Args:
            kantonsnummer
        Returns:
            Kantonsname
        Raises:
            -
        """
        _params = {}
        _params.update(
            {"where": "KANTONSNUMMER={0} and KANTON_TEIL < 2".format(kanotnid)}
        )
        _params.update({"outFields": "NAME,KANTON_TEIL"})
        _params.update({"returnGeometry": "false"})
        _params.update({"f": "json"})
        _req = self.__get_jsonfromurl(self.__url_tlm_kantonsgebiet, _params)
        _features = _req["features"]
        if len(_features) == 0:
            return ""
        elif len(_features) == 1:
            return _features[0]["attributes"]["NAME"]
        else:
            raise ValueError("To many districts found")

    def __query_bezirk_name(self, bezirkid=0):
        """ Gets the name of the bezirk from bezirksgebiet if there is no bezirk, enpty string
        Args:
            bezirksnummer
        Returns:
            Bezirksname
        Raises:
            -
        """
        if bezirkid is not None:
            _params = {}
            _params.update(
                {"where": "BEZIRKSNUMMER={0} and BEZIRK_TEIL < 2".format(bezirkid)}
            )
            _params.update({"outFields": "NAME,BEZIRK_TEIL"})
            _params.update({"returnGeometry": "false"})
            _params.update({"f": "json"})
            _req = self.__get_jsonfromurl(self.__url_tlm_bezirksgebiet, _params)
            _features = _req["features"]
            if len(_features) == 0:
                return ""
            elif len(_features) == 1:
                return _features[0]["attributes"]["NAME"]
            else:
                raise ValueError("To many districts found")
        else:
            return ""

    def __query_bezirk_kanton_id(self, bfsnummer=0):
        """ Gets the bezirksnummer, kantonsnummer from the hoheitsgebiet
        Args:
            gemeinde bfsnummer
        Returns:
            bezirksnummer, kantonsnummer
        Raises:
            -
        """
        _params = {}
        _params.update({"where": "BFS_NUMMER={0} and GEM_TEIL < 2".format(bfsnummer)})
        _params.update({"outFields": "GEM_TEIL,BEZIRKSNUMMER,KANTONSNUMMER"})
        _params.update({"returnGeometry": "false"})
        _params.update({"f": "json"})
        _req = self.__get_jsonfromurl(self.__url_tlm_hoheitsgebiet, _params)
        _features = _req["features"]
        if len(_features) == 1:
            return (
                _features[0]["attributes"]["BEZIRKSNUMMER"],
                _features[0]["attributes"]["KANTONSNUMMER"],
            )
        else:
            raise ValueError("To many municipalities found")

    def __find_gde_bfsnr(self, gde="", kt=""):
        """ Gets the gemeinde bfsnummer from ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill
        Args:
            gemeinde name, kantonskuerzel
        Returns:
            true if found, false if not found and gemeinde bfsnummer
        Raises:
            -
        """
        _params = {}
        _params.update(
            {"layer": "ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill"}
        )
        _params.update({"searchText": "{0}".format(gde)})
        _params.update({"searchField": "gemname"})
        _params.update({"returnGeometry": "false"})
        _req = requests.get(
            url=self.__url_api3_find,
            proxies=self.__getproxy,
            params=_params,
            verify=False,
        )
        if _req.status_code == 200:
            _json = json.loads(_req.content)
            _results = _json["results"]
            # print(_results)
            if len(_results) == 0:
                return False, "gemname not found"
            else:
                for _ele in _results:
                    if _ele["attributes"]["kanton"] == kt:
                        return True, _ele["id"]
                return False, "gemname in kanton not found"
        else:
            return False, _req.content

    def __search_location(self, location):
        """ Gets the Gemeindename
        Args:
            egris_egrid
        Returns:
            rue if found, false if not found and gemeindename
        Raises:
            -
        """
        _params = {}
        _params.update({"searchText": "{0}".format(location)})
        _params.update({"type": "locations"})
        _req = requests.get(
            url=self.__url_api3_search_server,
            proxies=self.__getproxy,
            params=_params,
            verify=False,
        )
        if _req.status_code == 200:
            _json = json.loads(_req.content)
            _results = _json["results"]
            if len(_results) == 1:
                _clean = re.compile("<.*?>")
                return (
                    True,
                    re.sub(_clean, "", _results[0]["attrs"]["label"].split(" ")[0]),
                )
            else:
                return False, "egris_egrid not found"
        else:
            return False, _req.content

    def getparzinfo(self, distance=None):
        """ Gets infos to the parzelle in a array of dictionary (ParzNummer,egris_egrid,Gemeinde,
        BFSNummer,Bezirk,Kanton)
        Args:
            optional search distance, overwrites the default distance
        Returns:
            array of dictionary
        Raises:
            -
        """
        _parzinfos = []
        _envelope = ""
        if distance is None:
            _envelope = (
                str(self.getpt_east - self.getdistance)
                + ","
                + str(self.getpt_north - self.getdistance)
                + ","
                + str(self.getpt_east + self.getdistance)
                + ","
                + str(self.getpt_north + self.getdistance)
            )
        else:
            _envelope = (
                str(self.getpt_east - distance)
                + ","
                + str(self.getpt_north - distance)
                + ","
                + str(self.getpt_east + distance)
                + ","
                + str(self.getpt_north + distance)
            )
        _parms1 = self.__params
        _parms1["geometry"] = _envelope
        _parms1["layers"] = "all:ch.kantone.cadastralwebmap-farbe"

        _req = requests.get(
            url=self.__url_api3_identify,
            proxies=self.__getproxy,
            params=_parms1,
            verify=False,
        )
        if _req.status_code == 200:
            _json = json.loads(_req.content)
            for _key, _val in _json.items():
                for _featureid in _val:
                    for _attrkey, _attrval in _featureid["attributes"].items():
                        if _attrkey == "egris_egrid":
                            _found, _gde = self.__search_location(_attrval)
                            if _found:
                                _found, _gdeinfo = self.__find_gde_bfsnr(
                                    _gde, _featureid["attributes"]["label"]
                                )
                                if _found:
                                    _parzinfodict = {}
                                    _beznr, _ktnr = self.__query_bezirk_kanton_id(
                                        _gdeinfo
                                    )
                                    _parzinfodict.update(
                                        {
                                            "ParzNummer": _featureid["attributes"][
                                                "number"
                                            ]
                                        }
                                    )
                                    _parzinfodict.update(
                                        {
                                            "egris_egrid": _featureid["attributes"][
                                                "egris_egrid"
                                            ]
                                        }
                                    )
                                    _parzinfodict.update({"Gemeinde": _gde})
                                    _parzinfodict.update({"BFSNummer": _gdeinfo})
                                    _parzinfodict.update(
                                        {"Bezirk": self.__query_bezirk_name(_beznr)}
                                    )
                                    _parzinfodict.update(
                                        {"Kanton": self.__query_kantons_name(_ktnr)}
                                    )
                                    _parzinfos.append(_parzinfodict)
        else:
            return _req.status_code, json.loads(_req.content)
        return _parzinfos
