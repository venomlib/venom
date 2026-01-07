/**
 * Group properties
 */
export var GroupSettings;
(function (GroupSettings) {
    /**
     * Define how can send message in the group
     * `true` only admins
     * `false` everyone
     */
    GroupSettings["ANNOUNCEMENT"] = "announcement";
    /**
     * Define how can edit the group data
     * `true` only admins
     * `false` everyone
     */
    GroupSettings["RESTRICT"] = "restrict";
    /**
     * Non-Documented
     */
    GroupSettings["NO_FREQUENTLY_FORWARDED"] = "no_frequently_forwarded";
    /**
     * Enable or disable temporary messages
     * `true` to enable
     * `false` to disable
     */
    GroupSettings["EPHEMERAL"] = "ephemeral";
})(GroupSettings || (GroupSettings = {}));
//# sourceMappingURL=group-settings.js.map