# -*- coding: utf-8 -*-
# -------------------------------------------------------------------------------------------------
# -- IdentifyFeaturesExample.py
#    Shows how to use IdentifyFeatures class
# -- Author: flu, 09.11.2020
# -- commandline: -
# -------------------------------------------------------------------------------------------------
# -- History
# -------------------------------------------------------------------------------------------------
import sys
import json
from IdentifyFeatures import IdentifyFeatures


def show_example(identifyfeature):
    """
    Writes the requested results and parameters

    :param identifyfeature: class with the request to the identify of api3.geo.admin.ch
    :return: -
    """
    _status, _results = identifyfeature.getjson()
    if _status == 200:
        _resultcount = 0
        for _key, _val in _results.items():
            for _featureid in _val:
                print("FeatureID: {0}".format(_featureid["featureId"]))
                print("LayerBodId: {0}".format(_featureid["layerBodId"]))
                print("LayerName: {0}".format(_featureid["layerName"]))
                print("id: {0}".format(_featureid["id"]))
                for _attrkey, _attrval in _featureid["attributes"].items():
                    print("   {0} = {1}".format(_attrkey, _attrval))
                _resultcount += 1
        print("----------------------------------------------")
        print("Found {0} results".format(_resultcount))
        print(
            "E {0} / N {1}".format(
                identifyfeature.getpt_east, identifyfeature.getpt_north
            )
        )
        print("Dist: {0} Meter".format(identifyfeature.getdistance))
        print("Layer:")
        for _layer in identifyfeature.getlayerlist:
            print("   {0}".format(_layer))
        print("----------------------------------------------")

    else:
        print(_status)


# ------------------------------------------------------------------------------
#                                    M A I N
# ------------------------------------------------------------------------------
if __name__ == "__main__":
    """ Entrypoint for the application.

    - set's up the logging
    - logs some basic infos
    initialises the parameters and checks the input parameter sys.argv

    Args:

    Returns:
        exitcode 0: no error
        exitcode -1: could not init logging
        exitcode -2. could not init parameter
        exitcode -3: colud not export file

    Raises:
    """
    _version = 0.1

    import requests

    #show_example(IdentifyFeatures())
    #show_example(IdentifyFeatures((2583759.0, 1210591.0)))
    #show_example(IdentifyFeatures((2583759.0, 1210591.0), 5000.0))
    #show_example(
    #    IdentifyFeatures(
    #        (2583759.0, 1210591.0), 1.0, "ch.kantone.cadastralwebmap-farbe"
    #    )
    #)
    _layerlist = (
        "ch.kantone.cadastralwebmap-farbe"
        + ","
        + "ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill"
        + ","
        + "ch.swisstopo.swissboundaries3d-bezirk-flaeche.fill"
        + ","
        + "ch.swisstopo.swissboundaries3d-kanton-flaeche.fill"
    )
    #show_example(IdentifyFeatures((2583759.0, 1210591.0), 1.0, _layerlist))
    idf = IdentifyFeatures((2588430.3, 1219348.9), 1.0, "ch.kantone.cadastralwebmap-farbe")
    idf.getparzinfo(0)

    #idf2 = IdentifyFeatures((2583759.0, 1210591.0), 5000.0)
    #idf2.getparzinfo()