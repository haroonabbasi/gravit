(function (_) {

    /**
     * Action for cloning the current view
     * @class GNewWindowAction
     * @extends GAction
     * @constructor
     */
    function GNewWindowAction() {
    };
    IFObject.inherit(GNewWindowAction, GAction);

    GNewWindowAction.ID = 'view.clone';
    GNewWindowAction.TITLE = new IFLocale.Key(GNewWindowAction, "title");

    /**
     * @override
     */
    GNewWindowAction.prototype.getId = function () {
        return GNewWindowAction.ID;
    };

    /**
     * @override
     */
    GNewWindowAction.prototype.getTitle = function () {
        return GNewWindowAction.TITLE;
    };

    /**
     * @override
     */
    GNewWindowAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_VIEW;
    };

    /**
     * @override
     */
    GNewWindowAction.prototype.getGroup = function () {
        return "view";
    };

    /**
     * @override
     */
    GNewWindowAction.prototype.getShortcut = function () {
        return [IFKey.Constant.META, IFKey.Constant.OPTION, 'N'];
    };

    /**
     * @override
     */
    GNewWindowAction.prototype.isEnabled = function () {
        return !!gApp.getWindows().getActiveWindow();
    };

    /**
     * @override
     */
    GNewWindowAction.prototype.execute = function () {
        gApp.getWindows().addWindow(gApp.getWindows().getActiveWindow());
    };

    /** @override */
    GNewWindowAction.prototype.toString = function () {
        return "[Object GNewWindowAction]";
    };

    _.GNewWindowAction = GNewWindowAction;
})(this);