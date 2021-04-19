# -*- coding: utf-8 -*-
# -------------------------------------------------------------------------------------------------
# -- IdentifyFeaturesExample.py
#    Shows how to use IdentifyFeatures class
# -- Author: flu, 09.11.2020
# -- commandline: -
# -------------------------------------------------------------------------------------------------
# -- History
# -- 0.2: flu, 20.11.2020 some issue with json, gets also info if no parz found
# -------------------------------------------------------------------------------------------------
import json

from IdentifyFeatures import IdentifyFeatures


def show_example(identifyfeature):
    """
    Writes the requested results and parameters

    :param identifyfeature: class with the request to the identify of api3.geo.admin.ch
    :return: -
    """
    _status, _results = identifyfeature.api3identify()
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
    """ Shows the usage of IdentifyFeature class with some examples
    """
    _version = 0.2

    show_example(IdentifyFeatures())
    show_example(IdentifyFeatures((2790105.995, 1162114.837)))
    show_example(IdentifyFeatures((2583759.0, 1210591.0)))
    show_example(IdentifyFeatures((2583759.0, 1210591.0), 5000.0))
    show_example(
        IdentifyFeatures(
            (2583759.0, 1210591.0), 1.0, "ch.kantone.cadastralwebmap-farbe"
        )
    )

    _layerlist = (
        "ch.kantone.cadastralwebmap-farbe"
        + ","
        + "ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill"
        + ","
        + "ch.swisstopo.swissboundaries3d-bezirk-flaeche.fill"
        + ","
        + "ch.swisstopo.swissboundaries3d-kanton-flaeche.fill"
    )

    print("mehrere Gemeinden")
    show_example(IdentifyFeatures((2583759.0, 1210591.0), 1.0, _layerlist))

    print("1 Gemeinde")
    idf1 = IdentifyFeatures((2600981.0, 1197447.5))
    _parzinfo = idf1.getparzinfo()
    print("Anzahl Resultate: {0}".format(len(json.loads(_parzinfo))))
    print(_parzinfo)

    print("2 Gemeinden")
    idf2 = IdentifyFeatures((2583759.0, 1210591.0), 5000.0)
    _parzinfo = idf2.getparzinfo(10.0)
    print("Anzahl Resultate: {0}".format(len(json.loads(_parzinfo))))
    print(_parzinfo)

    print("Kanton Uri, keine Bezirke")
    _idf3 = IdentifyFeatures((2692550.0, 1186425.0))
    _parzinfo = _idf3.getparzinfo(1.0)
    print("Anzahl Resultate: {0}".format(len(json.loads(_parzinfo))))
    print(_parzinfo)

    print("Keine Daten der AV")
    _idf4 = IdentifyFeatures((2584910.0, 1164562.5))
    _parzinfo = _idf4.getparzinfo(1.0)
    print("Anzahl Resultate: {0}".format(len(json.loads(_parzinfo))))
    print(_parzinfo)

    print("Staatswald Galm")
    _idf5 = IdentifyFeatures((2579915.0, 1196222.5))
    _parzinfo = _idf5.getparzinfo(1.0)
    print("Anzahl Resultate: {0}".format(len(json.loads(_parzinfo))))
    print(_parzinfo)

    print("Titlis")
    _idf6 = IdentifyFeatures((2676312.480, 1180581.130))
    _parzinfo = _idf6.getparzinfo()
    print("Anzahl Resultate: {0}".format(len(json.loads(_parzinfo))))
    print(_parzinfo)
