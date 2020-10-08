# -*- coding: utf-8 -*-
# -------------------------------------------------------------------------------------------------
# -- RunQA.py
#    Run Verification Tool based on XML from ProSuite.
# -- Author: flu, 28.09.2020
# -- commandline: # XML GDB OUT
#                 GDB is WorkspaceID,Workspace and if more then one, separated with ;
#                 example: #
#                          D:\work\git\suite-fida\Client\QA\xml\QA3D.xml
#                          FIDA,
#                          \\v0t0020a.adr.admin.ch\iprod\gisprod\01_Auftraege-Projekte\13_FIDA\gdb\
#                            gdb_all_pkt_viele_attribute\FIDA-DB-Schema.gdb;
#                          PRODAS,D:\work\git\tool-fida\sde\PRODASP@Prodas_reader.sde
#                          d:\temp
# -------------------------------------------------------------------------------------------------
# -- History
# -- 0.2, 05.10.2020, flu, added idxDS
# -------------------------------------------------------------------------------------------------

import datetime
import os
import shutil
import sys
import time

import arcpy

idxTool = 1
idxXml = 2
idxGdb = 3
idxOut = 4

logfile = ""


# ------------------------------------------------------------------------------
# Logging
# ------------------------------------------------------------------------------
def log(text):
    with open(logfile, "a") as f:
        f.write(text)
        f.write("\n")
        arcpy.AddMessage(text)


# ------------------------------------------------------------------------------
# Check input parameter
# ------------------------------------------------------------------------------
def check_params(args):
    if args[idxTool] == "#":
        args[idxTool] = os.path.join(
            "C:\\",
            "Program Files",
            "Esri Switzerland",
            "ProSuite Geoprocessing",
            "gp",
            "ProSuite.tbx",
        )
    if not os.path.isfile(args[idxTool]):
        arcpy.AddError("Path to toolbox is not correct")
        sys.exit(-1)

    if not os.path.isfile(args[idxXml]):
        arcpy.AddError("Path to XML-file is not correct")
        sys.exit(-1)

    _ws_list = args[idxGdb].split(";")
    for _ws in _ws_list:
        _ws_name = str(_ws.split(",")[1])
        if _ws_name.endswith(".gdb"):
            if not os.path.isdir(_ws_name):
                arcpy.AddError("Path to datasource GDB is not correct")
                sys.exit(-1)
        elif _ws_name.endswith(".sde"):
            if not os.path.isfile(_ws_name):
                arcpy.AddError("Path to datasource SDE is not correct")
        else:
            arcpy.AddError("unknown datasourc {0}, script will exit".format(_ws_name))
            sys.exit(-1)

    if os.path.isdir(args[idxOut]):
        try:
            arcpy.AddError(
                "Output directory does already exist. Deleting output directory"
            )
            shutil.rmtree(args[idxOut])
        except Exception as e:
            arcpy.AddError("Error while deleting output directory")
            arcpy.AddError(e.message)
            sys.exit(-1)


# ------------------------------------------------------------------------------
# Main
# ------------------------------------------------------------------------------
def main(args):
    arcpy.ImportToolbox(args[idxTool])

    log("Start")
    _start_time = time.time()

    res = arcpy.XmlBasedVerificationTool_ProSuite(
        in_xmlfile=args[idxXml],
        in_qualityspecification="FIDA Base",
        in_tilesize="100000",
        in_datasources=args[idxGdb].replace(",", " "),
        # in_ignoreconditionsforunknowndatasets="No",
        out_outputdirectory=args[idxOut],
        in_issuerepositorytype="File Geodatabase",
    )
    # in_compressissuefgdb="Yes",
    # in_options_xmlfile="",
    # in_aoi_layer="",
    # in_aoi_whereclause="",
    # in_aoi_bufferdistance="",
    # in_aoi_generalizationtolerance="",
    # in_aoi_description="",
    # in_report_properties=""

    _elapsed = time.time() - _start_time
    log("Outputdirectory: " + str(res.getOutput(0)))
    log("Fulfilled:       " + str(res.getOutput(1)))
    log("Warnings:        " + str(res.getOutput(2)))
    log("Errors:          " + str(res.getOutput(3)))
    log("Number of rows with stop condition:  " + str(res.getOutput(4)))
    log("Number of exceptions:                " + str(res.getOutput(5)))
    log("Number of unused exception objects: " + str(res.getOutput(6)))
    log("Processingtime                    : " + str(_elapsed))
    log(" ")
    # log("Messages: " + str(res.getMessages()))


# ------------------------------------------------------------------------------
# __main__
# ------------------------------------------------------------------------------
if __name__ == "__main__":
    if len(sys.argv) == 5:
        args = sys.argv
        check_params(args)
        logfile = os.path.join(
            os.path.dirname(args[idxOut]),
            datetime.datetime.now().strftime("%Y-%m-%d_%H%M%S") + "_log.txt",
        )
        log("Logfile: " + logfile)
        log(args[idxGdb].replace(",", " "))
        main(args)

    else:
        arcpy.AddError(
            "Not the correct number of input parameter! {0} is not 5".format(
                str(len(sys.argv))
            )
        )
        exit(-1)
