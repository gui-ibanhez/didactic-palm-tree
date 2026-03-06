/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

/**
 * Table appearance settings.
 */
class TableCardSettings extends FormattingSettingsCard {
    headerBackground = new formattingSettings.ColorPicker({
        name: "headerBackground",
        displayName: "Header background",
        value: { value: "#e9f2ff" }
    });

    rowAlternateBackground = new formattingSettings.ColorPicker({
        name: "rowAlternateBackground",
        displayName: "Alternate row background",
        value: { value: "#f7f9fc" }
    });

    selectedRowBackground = new formattingSettings.ColorPicker({
        name: "selectedRowBackground",
        displayName: "Selected row background",
        value: { value: "#dbeafe" }
    });

    showGridLines = new formattingSettings.ToggleSwitch({
        name: "showGridLines",
        displayName: "Show grid lines",
        value: true
    });

    fontSize = new formattingSettings.NumUpDown({
        name: "fontSize",
        displayName: "Font size",
        value: 12
    });

    name: string = "table";
    displayName: string = "Table";
    slices: Array<FormattingSettingsSlice> = [
        this.headerBackground,
        this.rowAlternateBackground,
        this.selectedRowBackground,
        this.showGridLines,
        this.fontSize
    ];
}

/**
 * Tooltip behavior settings.
 */
class TooltipCardSettings extends FormattingSettingsCard {
    enabled = new formattingSettings.ToggleSwitch({
        name: "enabled",
        displayName: "Enable tooltips",
        value: true
    });

    name: string = "tooltips";
    displayName: string = "Tooltips";
    slices: Array<FormattingSettingsSlice> = [this.enabled];
}

/**
* visual settings model class
*
*/
export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    // Create formatting settings model formatting cards
    tableCard = new TableCardSettings();
    tooltipCard = new TooltipCardSettings();

    cards = [this.tableCard, this.tooltipCard];
}
