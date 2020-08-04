"use strict";

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.array.filter");

require("core-js/modules/es.array.from");

require("core-js/modules/es.array.index-of");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.map");

require("core-js/modules/es.array.slice");

require("core-js/modules/es.array.sort");

require("core-js/modules/es.object.assign");

require("core-js/modules/es.object.get-own-property-descriptors");

require("core-js/modules/es.regexp.to-string");

require("core-js/modules/web.dom-collections.for-each");

require("core-js/modules/web.dom-collections.iterator");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _moment = _interopRequireDefault(require("moment"));

var _TreeTable = _interopRequireDefault(require("./TreeTable"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

class BootstrapTreeTable extends _react.default.Component {
  constructor(props) {
    super(props);
    let initialState = this.generateInitialState(); //bind functions passed to TreeTablef

    this.sortByField = this.sortByField.bind(this);
    this.applyFilter = this.applyFilter.bind(this);
    this.expandOrCollapseAll = this.expandOrCollapseAll.bind(this);
    this.resetSorting = this.resetSorting.bind(this);
    this.rowExpandOrCollapse = this.rowExpandOrCollapse.bind(this); // set state

    this.state = {
      enhancedTableData: initialState.enhancedTableData,
      expanded: false,
      enhancedColumns: initialState.enhancedColumns,
      showResetSortingButton: initialState.showResetSortingButton,
      childrenPresent: initialState.childrenPresent,
      filterValue: '',
      filtered: false
    };
  }

  generateInitialState() {
    let visibleRows = this.props.control.hasOwnProperty('visibleRows') ? this.props.control.visibleRows : 1;
    let enhancedTableData = this.generateStateTableData(this.props.tableData, visibleRows);
    let enhancedColumns = this.generateColumnState(this.props.columns);
    let initialSortField = null;
    let initialSortColumn = null;
    let initialSortOrder = null;
    let showResetSortingButton = false;
    enhancedColumns.forEach((column, index) => {
      if (column.sortOrder !== 'none') {
        initialSortField = column.dataField;
        initialSortColumn = index;
        initialSortOrder = column.sortOrder;
      }
    });
    let childrenPresent = false;

    var _iterator = _createForOfIteratorHelper(enhancedTableData),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        const entry = _step.value;

        if (entry.children && entry.children.length > 0) {
          childrenPresent = true;
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    if (initialSortField !== null) {
      enhancedTableData = this.sortBy(enhancedTableData, initialSortColumn, initialSortField, initialSortOrder, enhancedColumns[initialSortColumn].sortUsingRenderer, enhancedColumns[initialSortColumn].renderer, enhancedColumns[initialSortColumn].sortType, enhancedColumns[initialSortColumn].sortDateFormat);
      enhancedTableData = this.generateRowOrderedTree(enhancedTableData);
    }

    return {
      enhancedTableData: enhancedTableData,
      enhancedColumns: enhancedColumns,
      showResetSortingButton: showResetSortingButton,
      childrenPresent: childrenPresent
    };
  }

  generateStateTableData(tree, visibleRows) {
    let n = 1;
    return function recurse(children, parent = 0, rowLevel = 1) {
      if (children) {
        return children.map(node => {
          let rowID = n++;
          return Object.assign({}, node, {
            rowID: rowID,
            rowOrder: rowID,
            rowLevel: rowLevel,
            parentRowID: parent,
            visible: rowLevel <= visibleRows,
            expanded: rowLevel < visibleRows,
            filtered: false,
            children: recurse(node.children, rowID, rowLevel + 1)
          });
        });
      }
    }(tree);
  }

  generateColumnState(initialColumns) {
    return initialColumns.map(node => {
      let sortOrder = node.hasOwnProperty('sortOrder') ? node.sortOrder : 'none';
      return Object.assign({}, node, {
        sortable: node.hasOwnProperty('sortable') ? node.sortable : true,
        sortType: node.hasOwnProperty('sortType') ? node.sortType : 'string',
        sortOrder: sortOrder
      });
    });
  } // state-changing functions below here
  //expand/collapse


  expandOrCollapseAll() {
    let action = !this.state.expanded;

    let newTree = function recurse(children) {
      return children.map(node => {
        let visibleAction = node.rowLevel === 1 ? true : action;
        return Object.assign({}, node, {
          visible: visibleAction,
          expanded: action,
          children: recurse(node.children)
        });
      });
    }(this.state.enhancedTableData);

    this.setState({
      enhancedTableData: newTree,
      expanded: action
    });
  }

  rowExpandOrCollapse(selectedRowID) {
    let newTree = this.expandOrCollapseTree(this.state.enhancedTableData, selectedRowID, false, false);
    this.setState({
      enhancedTableData: newTree
    });
  }

  expandOrCollapseTree(data, selectedRowID, expandAll, collapseAll) {
    return function recurse(children, expandBranch = expandAll, collapseBranch = collapseAll) {
      return children.map(node => {
        let setExpanded = node.rowID === selectedRowID ? !node.expanded : node.expanded;
        let setVisible = node.parentRowID === selectedRowID ? !node.visible : node.visible;

        if (expandBranch) {
          setExpanded = true;
          setVisible = true;
        }

        if (collapseBranch) {
          setExpanded = false;
          setVisible = false;
        } //collapse and hide all below


        if (node.parentRowID === selectedRowID && !setVisible) {
          collapseBranch = true;
        }

        return Object.assign({}, node, {
          visible: setVisible,
          expanded: setExpanded,
          children: recurse(node.children, expandBranch, collapseBranch)
        });
      });
    }(data);
  } //sorting


  sortByField(sortColumn) {
    let sortStatus = this.state.enhancedColumns[sortColumn].sortOrder;
    let sortOrder = 'asc';

    if (sortStatus === 'asc') {
      sortOrder = 'desc';
    }

    let newTree = this.sortBy(this.state.enhancedTableData, sortColumn, this.state.enhancedColumns[sortColumn].dataField, sortOrder, this.state.enhancedColumns[sortColumn].sortUsingRenderer, this.state.enhancedColumns[sortColumn].renderer, this.state.enhancedColumns[sortColumn].sortType, this.state.enhancedColumns[sortColumn].sortDateFormat);
    let orderedNewTree = this.generateRowOrderedTree(newTree);
    const newColumns = this.state.enhancedColumns.map(a => _objectSpread(_objectSpread({}, a), {}, {
      sortOrder: 'none'
    }));
    newColumns[sortColumn].sortOrder = sortOrder;
    this.setState({
      enhancedTableData: orderedNewTree,
      enhancedColumns: newColumns,
      showResetSortingButton: true
    });
  }

  generateRowOrderedTree(oldTree) {
    let n = 0;
    return function recurse(children) {
      if (children) {
        return children.map(node => {
          return Object.assign({}, node, {
            rowOrder: n++,
            children: recurse(node.children)
          });
        });
      }
    }(oldTree);
  }

  sortBy(data, sortColumn, fieldName, direction, sortUsingRenderer, renderer, sortType, sortDateFormat) {
    data.forEach(entry => {
      if (entry.children && entry.children.length > 0) {
        entry.children = this.sortBy(entry.children, sortColumn, fieldName, direction, sortUsingRenderer, renderer, sortType, sortDateFormat);
      }
    });

    if (direction === 'asc') {
      return data.sort((a, b) => {
        return this.performSort(a, b, fieldName, sortUsingRenderer, renderer, sortType, sortDateFormat);
      });
    } else {
      return data.sort((b, a) => {
        return this.performSort(a, b, fieldName, sortUsingRenderer, renderer, sortType, sortDateFormat);
      });
    }
  }

  performSort(a, b, fieldName, sortUsingRenderer, renderer, sortType, sortDateFormat) {
    let aValue = a.data[fieldName];
    let bValue = b.data[fieldName];

    if (sortUsingRenderer) {
      aValue = renderer(a, fieldName);
      bValue = renderer(b, fieldName);
    }

    if (sortType === 'date') {
      return this.compareDates(aValue, bValue, sortDateFormat);
    }

    return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
  }

  compareDates(aValue, bValue, sortDateFormat) {
    aValue = (0, _moment.default)(aValue, sortDateFormat);
    bValue = (0, _moment.default)(bValue, sortDateFormat);
    return aValue.isBefore(bValue) ? -1 : aValue.isAfter(bValue) ? 1 : 0;
  }

  resetSorting() {
    let initialState = this.generateInitialState();
    this.setState({
      enhancedTableData: initialState.enhancedTableData,
      enhancedColumns: initialState.enhancedColumns,
      showResetSortingButton: initialState.showResetSortingButton
    });
  } //filtering


  applyFilter(event) {
    let filterValue = event.target.value;
    let columns = this.props.columns;
    let overallFiltered = false;

    let filteredNewTree = function recurse(children) {
      if (children) {
        return children.map(node => {
          let filtered = false;

          for (let i = 0; i < columns.length; i++) {
            let column = columns[i];
            let filter = column.hasOwnProperty("filterable") ? column.filterable : false;

            if (filter) {
              let columnValue = node.data[column.dataField];

              if (filterValue === '') {
                filtered = false;
              } else {
                if (String(columnValue).indexOf(String(filterValue)) !== -1) {
                  filtered = false;
                  overallFiltered = true;
                  break;
                } else {
                  filtered = true;
                }
              }
            }
          }

          return Object.assign({}, node, {
            filtered: filtered,
            children: recurse(node.children)
          });
        });
      }
    }(this.state.enhancedTableData);

    this.setState({
      enhancedTableData: filteredNewTree,
      filterValue: filterValue,
      filtered: overallFiltered
    });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps === this.props) return;
    this.resetSorting();
  }

  render() {
    return /*#__PURE__*/_react.default.createElement(_TreeTable.default, {
      tableData: this.state.enhancedTableData,
      control: this.props.control,
      filterValue: this.state.filterValue,
      filtered: this.state.filtered,
      className: this.props.className,
      containerClassName: this.props.containerClassName,
      applyFilter: this.applyFilter,
      expandOrCollapseAll: this.expandOrCollapseAll,
      expanded: this.state.expanded,
      resetSorting: this.resetSorting,
      extraHeader: this.props.extraHeader,
      showResetSortingButton: this.state.showResetSortingButton,
      enhancedColumns: this.state.enhancedColumns,
      sortByField: this.sortByField,
      childrenPresent: this.state.childrenPresent,
      rowExpandOrCollapse: this.rowExpandOrCollapse
    });
  }

}

BootstrapTreeTable.propTypes = {
  tableData: _propTypes.default.arrayOf(_propTypes.default.shape({
    data: _propTypes.default.object,
    children: _propTypes.default.arrayOf(_propTypes.default.object)
  })).isRequired,
  containerClassName: _propTypes.default.string,
  className: _propTypes.default.string,
  control: _propTypes.default.shape({
    visibleRows: _propTypes.default.number,
    showExpandCollapseButton: _propTypes.default.bool,
    allowSorting: _propTypes.default.bool,
    allowFiltering: _propTypes.default.bool,
    filterInputPlaceholderText: _propTypes.default.string,
    showPagination: _propTypes.default.bool,
    initialRowsPerPage: _propTypes.default.number
  }),
  columns: _propTypes.default.arrayOf(_propTypes.default.shape({
    dataField: _propTypes.default.string.isRequired,
    heading: _propTypes.default.string,
    fixedWidth: _propTypes.default.bool,
    percentageWidth: _propTypes.default.number,
    styleClass: _propTypes.default.string,
    renderer: _propTypes.default.func,
    sortable: _propTypes.default.bool,
    sortUsingRenderer: _propTypes.default.bool,
    sortOrder: _propTypes.default.string,
    sortType: _propTypes.default.oneOf(['string', 'date', 'number']),
    sortDateFormat: _propTypes.default.string,
    filterable: _propTypes.default.bool
  }))
};
BootstrapTreeTable.defaultProps = {
  tableData: [],
  containerClassName: '',
  className: '',
  control: {
    visibleRows: 1,
    showExpandCollapseButton: true,
    allowSorting: false,
    allowFiltering: false,
    filterInputPlaceholderText: 'Filter...',
    showPagination: false,
    initialRowsPerPage: 10
  },
  columns: [{
    dataField: '',
    heading: '',
    fixedWidth: false,
    percentageWidth: 0,
    renderer: null,
    sortable: true,
    styleClass: '',
    sortUsingRenderer: false,
    sortType: 'string',
    sortDateFormat: null,
    filterable: false
  }]
};
var _default = BootstrapTreeTable;
exports.default = _default;