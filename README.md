GC ToolBox
========
ToolBox.jsx is a script that can be run from within Adobe Illustrator that gives you access to a few tools built to make asset creation easier. 

To use, download ToolBox.jsx; then, from within Illustrator, choose File > Scripts > Other Script... and browse to ToolBox. (Alternatively, if you place a copy of the script within your Illustrator/Presets/en_US/Scripts directory, then you'll be able to choose it without browsing each time)

Running the script opens the ToolBox panel. From here, you can open WireCutter and/or ScrewDriver. 

WireCutter.jsx is built-in to ToolBox; though the original WireCutter script is available here as well. However, **WireCutter as a standalone script is depreciated**; please use ToolBox instead. (It includes bug fixes that may not be fixed in standalone WireCutter)

Tools
----
* ToolBox
 - Not really a tool, but the hub panel that launches either of the 2 toolsets.
 - Contains a console that logs out any errors ToolBox encounters
 - Includes an option to autosave after each tool use. 
* WireCutter
 - Set of tools for bulk asset exportation from Adobe Illustrator
 - Tutorial: http://www.gameclosure.com/blog/2013/07/automating-the-illustrator-art-pipeline-2 (though some of the UI will be different as this tutorial was written for the previous version)
* ScrewDriver
 - A set of tools that automate some common Illustrator needs
 - (currently, there is only 1 tool in the set; more to come)

WireCutter Tools
----------
* Library Batch Export
 - Exports every Symbol in the Library as a PNG
* Selection Batch Export
 - Exports every selected item as a PNG
* Text-Swap Batch Export
 - Exports a selected item and swaps all of its text content for new copy. (Useful for exporting bitmap fonts) 
* App Icon Export
 - Exports a selected item at multiple sizes at once; comes pre-loaded with the standard sizes for mobile icons

### Options:
* Create Subdirectories from Underscores
 - Any "_" characters in the item's name become "/" in the export path.
* Omit Names Beginning with "!"
 - Skips any item whose name starts with a "!" character. (Useful when creating symbols that are not meant to be exported on thier own in a Library Batch)
* Export with Shared Dimensions
 - Currently only works with Text Swap: Exports all items with the same diemensions; usually defined by the largest in the batch. (Useful in creating mono-spaced bitmap fonts)
