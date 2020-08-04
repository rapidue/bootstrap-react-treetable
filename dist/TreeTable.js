"use strict";

require("core-js/modules/es.array.concat");

require("core-js/modules/es.array.filter");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.map");

require("core-js/modules/web.dom-collections.for-each");

require("core-js/modules/web.dom-collections.iterator");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _reactFontawesome = require("@fortawesome/react-fontawesome");

var _freeSolidSvgIcons = require("@fortawesome/free-solid-svg-icons");

var _Paginator = _interopRequireDefault(require("./Paginator"));

require("./BootstrapTreeTable.css");

var _faSort = require("@fortawesome/free-solid-svg-icons/faSort");

var _faSortUp = require("@fortawesome/free-solid-svg-icons/faSortUp");

var _faSortDown = require("@fortawesome/free-solid-svg-icons/faSortDown");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class TreeTable extends _react.default.Component {
  constructor(props) {
    super(props);
    this.moveToSpecificPage = this.moveToSpecificPage.bind(this);
    let newTableData = this.filterNonVisibleRows(this.props.tableData);
    let endRow = 0;

    if (this.props.control.showPagination) {
      endRow = this.props.control.initialRowsPerPage > newTableData.length ? newTableData.length - 1 : this.props.control.initialRowsPerPage - 1;
    } else {
      endRow = newTableData.length - 1;
    }

    this.state = {
      startRow: 0,
      endRow: endRow,
      currentPage: 1,
      tableData: newTableData
    };
  }

  componentWillReceiveProps(nextProps) {
    let newTableData = this.filterNonVisibleRows(nextProps.tableData);
    let newStartAndEnd = this.calculateNewStartAndEndRows(this.state.currentPage, this.props.control.initialRowsPerPage, newTableData.length);
    this.setState({
      tableData: newTableData,
      filtered: nextProps.filtered,
      startRow: newStartAndEnd.startRow,
      endRow: newStartAndEnd.endRow,
      currentPage: newStartAndEnd.currentPage
    });
  }

  filterNonVisibleRows(data) {
    let self = this;
    let r = data.filter(function (o) {
      if (o.children) o.children = self.filterNonVisibleRows(o.children);
      return !o.filtered;
    });
    return r;
  }

  getMaxRowID(tree) {
    let entry = tree[tree.length - 1];

    if (entry.children && entry.children.length > 0) {
      return this.getMaxRowID(entry.children);
    }

    return entry.rowOrder;
  } //pagination


  moveToSpecificPage(page) {
    let newStartAndEnd = this.calculateNewStartAndEndRows(page, this.props.control.initialRowsPerPage, this.state.tableData.length);
    this.setState({
      startRow: newStartAndEnd.startRow,
      endRow: newStartAndEnd.endRow,
      currentPage: newStartAndEnd.currentPage
    });
  }

  calculateNewStartAndEndRows(page, rowsPerPage, tableLength) {
    let newPage = page; //check the current page isn't too high for the data provided

    let max = (page - 1) * rowsPerPage;

    if (max > tableLength) {
      newPage = Math.ceil(tableLength / rowsPerPage);
    } //calculate the start & end rows


    let newStartRow = (newPage - 1) * rowsPerPage;
    let newEndRow = newStartRow + rowsPerPage - 1;
    return {
      startRow: newStartRow,
      endRow: newEndRow,
      currentPage: newPage
    };
  }

  getNextRowID(tree, position) {
    let entry = tree[position];

    if (entry) {
      if (entry.children && entry.children.length > 0) {
        return this.getMaxRowID(entry.children);
      }

      return entry.rowOrder;
    } //if no entry at that position, return the last element


    return tree[tree.length - 1].rowOrder;
  }

  generateTableBody(tableData, startRow, endRow) {
    if (tableData.length > 0) {
      return this.generateTableBodyRows(tableData, startRow, endRow);
    } else {
      return null;
    }
  }

  generateTableBodyRows(tableData, startRow, endRow, className = 'root-row') {
    let tableBody = [];
    tableData.forEach((dataRow, index) => {
      debugger;

      if (index >= startRow && index <= endRow) {
        let rowData = this.processDataRow(dataRow);
        let key = dataRow.parentRowID + '-' + dataRow.rowID;
        let rowClass = dataRow.visible ? 'shown' : 'hidden';
        tableBody.push( /*#__PURE__*/_react.default.createElement("tr", {
          className: "".concat(rowClass, " ").concat(className),
          key: key
        }, rowData));

        if (dataRow.children) {
          tableBody.push(...this.generateTableBodyRows(dataRow.children, startRow, endRow, 'child-row'));
        }
      }
    });
    return tableBody;
  }

  generateExpandColumn(dataRow, key, dataField) {
    let output = dataRow.data[dataField];

    if (this.props.enhancedColumns[0].renderer) {
      output = this.props.enhancedColumns[0].renderer(dataRow, dataField);
    }

    if (!this.props.childrenPresent) {
      //no expander required
      if (this.props.enhancedColumns[0].fixedWidth) {
        return /*#__PURE__*/_react.default.createElement("td", {
          key: key,
          className: this.props.enhancedColumns[0].styleClass,
          width: this.props.enhancedColumns[0].percentageWidth + '%'
        }, output);
      } else {
        return /*#__PURE__*/_react.default.createElement("td", {
          key: key,
          className: this.props.enhancedColumns[0].styleClass
        }, output);
      }
    }

    if (dataRow.children && dataRow.children.length > 0) {
      let iconCell = /*#__PURE__*/_react.default.createElement(_reactFontawesome.FontAwesomeIcon, {
        icon: _freeSolidSvgIcons.faAngleRight,
        fixedWidth: true,
        onClick: this.props.rowExpandOrCollapse.bind(null, dataRow.rowID)
      });

      if (dataRow.expanded) {
        iconCell = /*#__PURE__*/_react.default.createElement(_reactFontawesome.FontAwesomeIcon, {
          icon: _freeSolidSvgIcons.faAngleDown,
          fixedWidth: true,
          onClick: this.props.rowExpandOrCollapse.bind(null, dataRow.rowID)
        });
      }

      if (this.props.enhancedColumns[0].fixedWidth) {
        return /*#__PURE__*/_react.default.createElement("td", {
          key: key,
          className: this.props.enhancedColumns[0].styleClass,
          width: this.props.enhancedColumns[0].percentageWidth + '%'
        }, /*#__PURE__*/_react.default.createElement("span", {
          style: {
            marginLeft: dataRow.rowLevel + 'em'
          }
        }, iconCell, /*#__PURE__*/_react.default.createElement("span", {
          className: "iconPadding"
        }, output)));
      } else {
        return /*#__PURE__*/_react.default.createElement("td", {
          key: key,
          className: this.props.enhancedColumns[0].styleClass
        }, /*#__PURE__*/_react.default.createElement("span", {
          style: {
            marginLeft: dataRow.rowLevel + 'em'
          }
        }, iconCell, /*#__PURE__*/_react.default.createElement("span", {
          className: "iconPadding"
        }, output)));
      }
    } else {
      if (this.props.enhancedColumns[0].fixedWidth) {
        return /*#__PURE__*/_react.default.createElement("td", {
          key: key,
          className: this.props.enhancedColumns[0].styleClass,
          width: this.props.enhancedColumns[0].percentageWidth + '%'
        }, /*#__PURE__*/_react.default.createElement("span", {
          style: {
            marginLeft: dataRow.rowLevel + 1.25 + 'em'
          }
        }, /*#__PURE__*/_react.default.createElement("span", {
          className: "iconPadding"
        }, output)));
      } else {
        return /*#__PURE__*/_react.default.createElement("td", {
          key: key,
          className: this.props.enhancedColumns[0].styleClass
        }, /*#__PURE__*/_react.default.createElement("span", {
          style: {
            marginLeft: dataRow.rowLevel + 1.25 + 'em'
          }
        }, /*#__PURE__*/_react.default.createElement("span", {
          className: "iconPadding"
        }, output)));
      }
    }
  }

  processDataRow(dataRow) {
    let rowBody = [];
    rowBody.push(this.props.enhancedColumns.map((column, index) => {
      let key = dataRow.parentRowID + '-' + dataRow.rowID + '-' + index;
      let output = dataRow.data[column.dataField];

      if (column.renderer) {
        output = this.props.enhancedColumns[index].renderer(dataRow, column.dataField);
      }

      if (index === 0) {
        return this.generateExpandColumn(dataRow, key, column.dataField);
      } else {
        if (column.fixedWidth) {
          return /*#__PURE__*/_react.default.createElement("td", {
            key: key,
            className: column.styleClass,
            width: column.percentageWidth + '%'
          }, output);
        } else {
          return /*#__PURE__*/_react.default.createElement("td", {
            key: key,
            className: column.styleClass
          }, output);
        }
      }
    }));
    return rowBody;
  }

  generateHeaderRow() {
    let headingRows = [];

    if (this.props.enhancedColumns) {
      headingRows.push(this.props.enhancedColumns.map((column, index) => {
        let fieldTitle = column.heading ? column.heading : column.dataField;
        let key = column.key ? column.key : column.dataField;
        let sortIcon = null;

        if (column.sortOrder === 'asc') {
          sortIcon = /*#__PURE__*/_react.default.createElement(_reactFontawesome.FontAwesomeIcon, {
            icon: _faSortUp.faSortUp,
            fixedWidth: true,
            pull: "right"
          });
        } else if (column.sortOrder === 'desc') {
          sortIcon = /*#__PURE__*/_react.default.createElement(_reactFontawesome.FontAwesomeIcon, {
            icon: _faSortDown.faSortDown,
            fixedWidth: true,
            pull: "right"
          });
        } else {
          sortIcon = /*#__PURE__*/_react.default.createElement(_reactFontawesome.FontAwesomeIcon, {
            icon: _faSort.faSort,
            fixedWidth: true,
            pull: "right"
          });
        }

        if (this.props.control.allowSorting && column.sortable) {
          return /*#__PURE__*/_react.default.createElement("th", {
            key: key,
            onClick: this.props.sortByField.bind(null, index)
          }, sortIcon, fieldTitle);
        } else {
          return /*#__PURE__*/_react.default.createElement("th", {
            key: key
          }, fieldTitle);
        }
      }));
    }

    return headingRows;
  }

  generatePaginatorRow() {
    if (this.props.control.showPagination && this.state.tableData.length > this.props.control.initialRowsPerPage) {
      let displayStartRow = this.state.startRow + 1;
      let displayEndRow = this.state.endRow > this.state.tableData.length ? this.state.tableData.length : this.state.endRow + 1;
      return /*#__PURE__*/_react.default.createElement(_Paginator.default, {
        currentPage: this.state.currentPage,
        tableLength: this.state.tableData.length,
        rowsPerPage: this.props.control.initialRowsPerPage,
        rowMover: this.moveToSpecificPage,
        displayStartRow: displayStartRow,
        displayEndRow: displayEndRow,
        displayTotal: this.state.tableData.length,
        displayFiltered: this.state.filtered,
        displayOverallTotal: this.props.tableData.length
      });
    }

    return /*#__PURE__*/_react.default.createElement("div", null);
  }

  render() {
    let headingRows = this.generateHeaderRow();
    let tableBody = this.generateTableBody(this.state.tableData, this.state.startRow, this.state.endRow);
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "container-fluid ".concat(this.props.containerClassName || '')
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "row col-12 justify-content-between"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "col-2"
    }, /*#__PURE__*/_react.default.createElement("button", {
      onClick: this.props.expandOrCollapseAll.bind(null),
      className: this.props.control.showExpandCollapseButton ? 'btn btn-outline-secondary' : 'hidden'
    }, this.props.expanded ? 'Collapse All' : 'Expand All')), /*#__PURE__*/_react.default.createElement("div", {
      className: "col-2"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: this.props.showResetSortingButton ? 'shown' : 'hidden'
    }, /*#__PURE__*/_react.default.createElement("button", {
      onClick: this.props.resetSorting.bind(null),
      className: "btn btn-outline-secondary"
    }, "Reset Sorting"))), /*#__PURE__*/_react.default.createElement("div", {
      className: "col-2"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: this.props.control.allowFiltering ? 'shown' : 'hidden'
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "input-group mb-3"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "input-group-prepend"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "input-group-text"
    }, /*#__PURE__*/_react.default.createElement(_reactFontawesome.FontAwesomeIcon, {
      icon: _freeSolidSvgIcons.faSearch,
      fixedWidth: true
    }))), /*#__PURE__*/_react.default.createElement("input", {
      type: "text",
      value: this.props.filterValue,
      id: "filterInput",
      onChange: this.props.applyFilter.bind(null),
      placeholder: this.props.control.filterInputPlaceholderText,
      className: "form-control"
    }))))), /*#__PURE__*/_react.default.createElement("div", {
      className: "row col-12"
    }, /*#__PURE__*/_react.default.createElement("table", {
      className: "table table-bordered ".concat(this.props.className || '')
    }, /*#__PURE__*/_react.default.createElement("thead", null, this.props.extraHeader ? this.props.extraHeader : null, /*#__PURE__*/_react.default.createElement("tr", {
      className: "rcyl-header"
    }, headingRows)), /*#__PURE__*/_react.default.createElement("tbody", null, tableBody))), /*#__PURE__*/_react.default.createElement("div", {
      className: "row col-12 justify-content-center"
    }, this.generatePaginatorRow()));
  }

}

var _default = TreeTable;
exports.default = _default;