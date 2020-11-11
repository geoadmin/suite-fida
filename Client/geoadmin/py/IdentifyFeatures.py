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

import requests


class IdentifyFeatures:
    """
    Shows how to get a json from https://api3.geo.admin.ch/rest/services/api/MapServer/identify
    Needs a point coordinate and a distance. The distance ist needed to caluculate a square with
    a side length twice the distance an the point in the center. This square is used as a
    intersecting envelope geometry with no buffer

    Attributes:
        point:    Where to identify, coordinate pair. First value ist east second is
                  north in LV95 (EPSG code 2056). Default is (2600000.000,1200000.000)
        distance: half length of the square in meter. Default = 1.0
        layers:   comma separated list of technical layer names like
                  ch.swisstopo.pixelkarte-pk25.metadata
    """

    def __init__(
        self,
        pt=(2600000.000, 1200000.000),
        distance=1.0,
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

    def getjson(self):
        _proxy = "proxy.admin.ch:8080"
        _proxy_dict = {"http": _proxy, "https": _proxy}
        _req = requests.get(
            url=self.__url, proxies=_proxy_dict, params=self.__params, verify=False
        )
        if  _req.status_code == 200:
            _json = json.loads(_req.content)
            for _key, _val in _json.items():
                for _featureid in _val:
                    print("LayerName: {0}".format(_featureid["layerName"]))
        else:
            return _req.status_code, json.loads(_req.content)

