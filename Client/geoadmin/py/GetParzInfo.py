# -*- coding: utf-8 -*-
# -------------------------------------------------------------------------------------------------
# -- GetParzInfo.py
#    Get the ParzNummer, egris_egrid, Gemeinde, BFSNummer, Bezirk, Kanton based on a LV95 coordinate
#    as a array of dictionary
# -- Author: flu, 16.11.2020
# -- commandline: east north distance(square around point with length 2 * distance)
#                 2600000.0 1200000.0 1.0
# -------------------------------------------------------------------------------------------------
# -- History
# -------------------------------------------------------------------------------------------------

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

    try:
        _args["dist"] = float(args[dist_idx])
    except OverflowError as ove:
        arcpy.AddError(ove)
        _status = -1
    except Exception as _err:
        arcpy.AddError(_err)
        _status = -1

    return _status, _args


def main(args):
    """ If all checks passed this methode is called

    """
    try:
        _idf = IdentifyFeatures((args["e"], args["n"]), args["dist"])
        _parz_info = _idf.getparzinfo()
        # arcpy.AddMessage(_parz_info)
        arcpy.SetParameter(arcpy.GetArgumentCount() - 2, _idf.getparzinfo())
        arcpy.AddMessage("{0} parcell(s) found".format(len(_parz_info)))
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
    _version = 0.1
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
