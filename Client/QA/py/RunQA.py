# -*- coding: utf-8 -*-
# -------------------------------------------------------------------------------------------------
# -- RunQA.py
#    Run Verification Tool based on XML from ProSuite.
# -- Author: flu, 28.09.2020
# -- commandline: # D:\work\git\suite-fida\Client\QA\xml\QALFP1a.xml \\v0t0020a.adr.admin.ch\iprod\gisprod\01_Auftraege-Projekte\13_FIDA\gdb\gdb_all_pkt_viele_attribute\FIDA-DB-Schema.gdb d:\temp\qafida
#                 # D:\work\git\suite-fida\Client\QA\xml\QALFP1a.xml D:\work\FIDA\FIDA.gdb d:\temp\qafida
# -------------------------------------------------------------------------------------------------
# -- History
# -------------------------------------------------------------------------------------------------

import arcpy
import os
import sys
import shutil
import time

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
def checkParams(args):
    if (args[idxTool] == "#"):
        args[idxTool] = os.path.join("C:\\","Program Files","Esri Switzerland","ProSuite Geoprocessing","gp","ProSuite.tbx")
    if not os.path.isfile(args[idxTool]):
        arcpy.AddMessage("Path to toolbox is not correct")
        sys.exit(-1)

    if not os.path.isfile(args[idxXml]):
        arcpy.AddMessage("Path to XML-file is not correct")
        sys.exit(-1)

    if not os.path.isdir(args[idxGdb]):
        arcpy.AddMessage("Path to datasource GDB is not correct")
        sys.exit(-1)

    if os.path.isdir(args[idxOut]):
        try:
            arcpy.AddMessage("Output directory does already exist. Deleting output directory")
            shutil.rmtree(args[idxOut])
        except:
            arcpy.AddMessage('Error while deleting output directory')
            sys.exit(-1)


# ------------------------------------------------------------------------------
# Main
# ------------------------------------------------------------------------------
def main(args):
    arcpy.ImportToolbox(args[idxTool])

    log("Start")
    _start_time = time.time()

    res = arcpy.XmlBasedVerificationTool_ProSuite(in_xmlfile=args[idxXml],
                                                  in_qualityspecification="FIDA Base",
                                                  in_tilesize="100000",
                                                  in_datasources="FIDA " + args[idxGdb],
                                                  # in_ignoreconditionsforunknowndatasets="No",
                                                  out_outputdirectory=args[idxOut],
                                                  in_issuerepositorytype="File Geodatabase")
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
    #log("Messages: " + str(res.getMessages()))


# ------------------------------------------------------------------------------
# __main__
# ------------------------------------------------------------------------------
if __name__ == '__main__':
    if len(sys.argv) == 5:
        args = sys.argv
        checkParams(args)
        logfile = os.path.join(os.path.dirname(args[idxOut]),
                               datetime.datetime.now().strftime('%Y-%m-%d_%H%M%S') + "_log.txt")
        arcpy.AddMessage("Logfile: " + logfile)
        main(args)

    else:
        arcpy.AddMessage("Not the correct number of input parameter!")
        exit(-1)
