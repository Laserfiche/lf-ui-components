export var FieldType;
(function (FieldType) {
    FieldType["DateTime"] = "DateTime";
    FieldType["Blob"] = "Blob";
    FieldType["Date"] = "Date";
    FieldType["ShortInteger"] = "ShortInteger";
    FieldType["LongInteger"] = "LongInteger";
    FieldType["List"] = "List";
    FieldType["Number"] = "Number";
    FieldType["String"] = "String";
    FieldType["Time"] = "Time";
})(FieldType || (FieldType = {}));
/** FieldFormat copied from Web Access */
export var FieldFormat;
(function (FieldFormat) {
    FieldFormat["None"] = "None";
    FieldFormat["ShortDate"] = "ShortDate";
    FieldFormat["LongDate"] = "LongDate";
    FieldFormat["ShortDateTime"] = "ShortDateTime";
    FieldFormat["LongDateTime"] = "LongDateTime";
    FieldFormat["ShortTime"] = "ShortTime";
    FieldFormat["LongTime"] = "LongTime";
    FieldFormat["GeneralNumber"] = "GeneralNumber";
    FieldFormat["Currency"] = "Currency";
    FieldFormat["Percent"] = "Percent";
    FieldFormat["Scientific"] = "Scientific";
    FieldFormat["Custom"] = "Custom";
})(FieldFormat || (FieldFormat = {}));
export var RedirectBehavior;
(function (RedirectBehavior) {
    RedirectBehavior["Replace"] = "Replace";
    RedirectBehavior["Popup"] = "Popup";
    RedirectBehavior["None"] = "None";
})(RedirectBehavior || (RedirectBehavior = {}));
// type RedirectBehavior = 'Replace' | 'Popup' | 'None'
export var LoginState;
(function (LoginState) {
    LoginState["LoggingIn"] = "LoggingIn";
    LoginState["LoggedIn"] = "LoggedIn";
    LoginState["LoggingOut"] = "LoggingOut";
    LoginState["LoggedOut"] = "LoggedOut"; // don't have tokens, previous state: LoggingOut, LoggingIn
})(LoginState || (LoginState = {}));
export var LoginMode;
(function (LoginMode) {
    LoginMode["Button"] = "Button";
    LoginMode["Menu"] = "Menu";
})(LoginMode || (LoginMode = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW51bXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy91aS1jb21wb25lbnRzL3NoYXJlZC9lbnVtcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLENBQU4sSUFBWSxTQVVYO0FBVkQsV0FBWSxTQUFTO0lBQ25CLGtDQUFxQixDQUFBO0lBQ3JCLDBCQUFhLENBQUE7SUFDYiwwQkFBYSxDQUFBO0lBQ2IsMENBQTZCLENBQUE7SUFDN0Isd0NBQTJCLENBQUE7SUFDM0IsMEJBQWEsQ0FBQTtJQUNiLDhCQUFpQixDQUFBO0lBQ2pCLDhCQUFpQixDQUFBO0lBQ2pCLDBCQUFhLENBQUE7QUFDZixDQUFDLEVBVlcsU0FBUyxLQUFULFNBQVMsUUFVcEI7QUFDRCx5Q0FBeUM7QUFDekMsTUFBTSxDQUFOLElBQVksV0FhWDtBQWJELFdBQVksV0FBVztJQUNyQiw0QkFBYSxDQUFBO0lBQ2Isc0NBQXVCLENBQUE7SUFDdkIsb0NBQXFCLENBQUE7SUFDckIsOENBQStCLENBQUE7SUFDL0IsNENBQTZCLENBQUE7SUFDN0Isc0NBQXVCLENBQUE7SUFDdkIsb0NBQXFCLENBQUE7SUFDckIsOENBQStCLENBQUE7SUFDL0Isb0NBQXFCLENBQUE7SUFDckIsa0NBQW1CLENBQUE7SUFDbkIsd0NBQXlCLENBQUE7SUFDekIsZ0NBQWlCLENBQUE7QUFDbkIsQ0FBQyxFQWJXLFdBQVcsS0FBWCxXQUFXLFFBYXRCO0FBRUQsTUFBTSxDQUFOLElBQVksZ0JBSVg7QUFKRCxXQUFZLGdCQUFnQjtJQUMxQix1Q0FBbUIsQ0FBQTtJQUNuQixtQ0FBZSxDQUFBO0lBQ2YsaUNBQWEsQ0FBQTtBQUNmLENBQUMsRUFKVyxnQkFBZ0IsS0FBaEIsZ0JBQWdCLFFBSTNCO0FBRUQsdURBQXVEO0FBQ3ZELE1BQU0sQ0FBTixJQUFZLFVBS1g7QUFMRCxXQUFZLFVBQVU7SUFDcEIscUNBQXVCLENBQUE7SUFDdkIsbUNBQXFCLENBQUE7SUFDckIsdUNBQXlCLENBQUE7SUFDekIscUNBQXVCLENBQUEsQ0FBQywyREFBMkQ7QUFDckYsQ0FBQyxFQUxXLFVBQVUsS0FBVixVQUFVLFFBS3JCO0FBRUQsTUFBTSxDQUFOLElBQVksU0FHWDtBQUhELFdBQVksU0FBUztJQUNuQiw4QkFBbUIsQ0FBQTtJQUNuQiwwQkFBZSxDQUFBO0FBQ2pCLENBQUMsRUFIVyxTQUFTLEtBQVQsU0FBUyxRQUdwQiIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBlbnVtIEZpZWxkVHlwZSB7XHJcbiAgRGF0ZVRpbWUgPSAnRGF0ZVRpbWUnLFxyXG4gIEJsb2IgPSAnQmxvYicsXHJcbiAgRGF0ZSA9ICdEYXRlJyxcclxuICBTaG9ydEludGVnZXIgPSAnU2hvcnRJbnRlZ2VyJyxcclxuICBMb25nSW50ZWdlciA9ICdMb25nSW50ZWdlcicsXHJcbiAgTGlzdCA9ICdMaXN0JyxcclxuICBOdW1iZXIgPSAnTnVtYmVyJyxcclxuICBTdHJpbmcgPSAnU3RyaW5nJyxcclxuICBUaW1lID0gJ1RpbWUnLFxyXG59XHJcbi8qKiBGaWVsZEZvcm1hdCBjb3BpZWQgZnJvbSBXZWIgQWNjZXNzICovXHJcbmV4cG9ydCBlbnVtIEZpZWxkRm9ybWF0IHtcclxuICBOb25lID0gJ05vbmUnLFxyXG4gIFNob3J0RGF0ZSA9ICdTaG9ydERhdGUnLFxyXG4gIExvbmdEYXRlID0gJ0xvbmdEYXRlJyxcclxuICBTaG9ydERhdGVUaW1lID0gJ1Nob3J0RGF0ZVRpbWUnLFxyXG4gIExvbmdEYXRlVGltZSA9ICdMb25nRGF0ZVRpbWUnLFxyXG4gIFNob3J0VGltZSA9ICdTaG9ydFRpbWUnLFxyXG4gIExvbmdUaW1lID0gJ0xvbmdUaW1lJyxcclxuICBHZW5lcmFsTnVtYmVyID0gJ0dlbmVyYWxOdW1iZXInLFxyXG4gIEN1cnJlbmN5ID0gJ0N1cnJlbmN5JyxcclxuICBQZXJjZW50ID0gJ1BlcmNlbnQnLFxyXG4gIFNjaWVudGlmaWMgPSAnU2NpZW50aWZpYycsXHJcbiAgQ3VzdG9tID0gJ0N1c3RvbScsXHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIFJlZGlyZWN0QmVoYXZpb3Ige1xyXG4gIFJlcGxhY2UgPSAnUmVwbGFjZScsXHJcbiAgUG9wdXAgPSAnUG9wdXAnLFxyXG4gIE5vbmUgPSAnTm9uZSdcclxufVxyXG5cclxuLy8gdHlwZSBSZWRpcmVjdEJlaGF2aW9yID0gJ1JlcGxhY2UnIHwgJ1BvcHVwJyB8ICdOb25lJ1xyXG5leHBvcnQgZW51bSBMb2dpblN0YXRlIHtcclxuICBMb2dnaW5nSW4gPSAnTG9nZ2luZ0luJywgLy8gc3RhcnRpbmcgT0F1dGggZmxvdywgcHJldmlvdXMgc3RhdGU6IExvZ2dlZE91dCwgTG9nZ2VkSW5cclxuICBMb2dnZWRJbiA9ICdMb2dnZWRJbicsICAvLyBoYXZlIHRva2VucywgcHJldmlvdXMgc3RhdGU6IExvZ2dpbmdJblxyXG4gIExvZ2dpbmdPdXQgPSAnTG9nZ2luZ091dCcsIC8vIGRvIGhhdmUgdG9rZW5zLCBidXQgZ2V0dGluZyByaWQgb2YgdGhlbSwgcHJldmlvdXMgc3RhdGU6IExvZ2dlZEluXHJcbiAgTG9nZ2VkT3V0ID0gJ0xvZ2dlZE91dCcgLy8gZG9uJ3QgaGF2ZSB0b2tlbnMsIHByZXZpb3VzIHN0YXRlOiBMb2dnaW5nT3V0LCBMb2dnaW5nSW5cclxufVxyXG5cclxuZXhwb3J0IGVudW0gTG9naW5Nb2RlIHtcclxuICAnQnV0dG9uJyA9ICdCdXR0b24nLFxyXG4gICdNZW51JyA9ICdNZW51J1xyXG59XHJcbiJdfQ==