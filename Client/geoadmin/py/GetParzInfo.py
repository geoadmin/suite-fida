# -*- coding: utf-8 -*-
# -------------------------------------------------------------------------------------------------
# -- GetParzInfo.py
#    Get the ParzNummer, egris_egrid, Gemeinde, BFSNummer, Bezirk, Kanton based on a LV95 coordinate
#    as a array of dictionary
# -- Author: flu, 16.11.2020
# -- commandline: east north distance(square around point with length 2 * distance)
#                 2600000.0 1200000.0 1.0
#                 2579915.0 1196222.5 1.0 Staatswald Galm
#                 2676312.480 1180581.130 Titlis
#                 2676312.480 1113000.000 1.0 nicht in der Schweiz
#                 2676312.480 1179000.000 1.0 keine AV Daten
#                 2628515.000 1149497.500 1.0 keine AV Daten, 3 Gemeinden
#                 2583759.000 1210591.000 5000.0 2 Gemeinden
# -------------------------------------------------------------------------------------------------
# -- History
# -- 0.2: flu, 20.11.2020 some issue with json, gets also info if no parz found
# -- 0.3: flu, 27.11.2020 refactoring IdentifyFeatures
# -------------------------------------------------------------------------------------------------

import json
import sys

import arcpy
from IdentifyFeatures import IdentifyFeatures

e_idx = 1
n_idx = 2
dist_idx = 3


def init(args):
    """ Checks if parameter values are float
        Args:
            sys.argv
        Returns:
            dictionary with floats and status=0 if ok, status=-1 if failed
        Raises:
            -
    """
    _args = {}
    _status = 0
    try:
        _args["e"] = float(args[e_idx])
    except OverflowError as ove:
        arcpy.AddError(ove)
        _status = -1
    except Exception as _err:
        arcpy.AddError(_err)
        _status = -1

    try:
        _args["n"] = float(args[n_idx])
    except OverflowError as ove:
        arcpy.AddError(ove)
        _status = -1
    except Exception as _err:
        arcpy.AddError(_err)
        _status = -1

    if len(args) > 3:
        try:
            _args["dist"] = float(args[dist_idx])
        except OverflowError as ove:
            arcpy.AddError(ove)
            _status = -1
        except Exception as _err:
            arcpy.AddError(_err)
            _status = -1
    else:
        _args["dist"] = 0.0
    return _status, _args


def main(args):
    """ If all checks passed this methode is called

    """
    try:
        _idf = IdentifyFeatures((args["e"], args["n"]), args["dist"])
        _parz_info = _idf.getparzinfo(float(args["dist"]))
        # arcpy.AddMessage(_parz_info)
        arcpy.SetParameter(arcpy.GetArgumentCount() - 2, _parz_info)
        arcpy.AddMessage("{0} parcell(s) found".format(len(json.loads(_parz_info))))
        return True
    except Exception as _err:
        arcpy.AddError(_err)
        return False


# ------------------------------------------------------------------------------
#                                    M A I N
# ------------------------------------------------------------------------------
if __name__ == "__main__":
    """ Entrypoint for the application.

    - logs some basic infos
    initialises the parameters and checks the input parameter sys.argv

    Args:

    Returns:
        exitcode  0: no error
        exitcode -1: could not init parameter
        exitcode -2. could not get ParzInfo

    Raises:
    """
    _version = 0.4
    arcpy.SetParameter(arcpy.GetArgumentCount() - 1, _version)
    _exitcode, _args = init(sys.argv)
    if _exitcode == 0:
        try:
            if main(_args):
                arcpy.AddMessage("Parzinfo executed successfully")
            else:
                arcpy.AddError("could not get ParzInfo")
                _exitcode = -2
        except Exception as _err:
            arcpy.AddError(_err)

    else:
        arcpy.AddError("could not init parameter")
        _exitcode = -1

    sys.exit(_exitcode)
