// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

/// @dev Very minimal ERC1155 implementation for testing purposes
contract MockERC1155 {
    mapping(uint256 => mapping(address => uint256)) private _balances;

    event TransferSingle(
        address indexed operator,
        address indexed from,
        address indexed to,
        uint256 id,
        uint256 value
    );

    function balanceOf(address _account, uint256 _id) external view returns (uint256) {
        return _balances[_id][_account];
    }

    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _id,
        uint256 _amount,
        bytes calldata
    ) external {
        require(_from == msg.sender, "ERC1155: caller is not token owner or approved");
        uint256 fromBalance = _balances[_id][_from];
        require(fromBalance >= _amount, "ERC1155: insufficient balance for transfer");
        unchecked {
            _balances[_id][_from] = fromBalance - _amount;
        }
        _balances[_id][_to] += _amount;
        emit TransferSingle(msg.sender, _from, _to, _id, _amount);
    }

    function mint(address _to, uint256 _tokenId, uint256 _amount) external {
        _balances[_tokenId][_to] += _amount;
    }
}
