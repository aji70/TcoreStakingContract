// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);

    function allowance(
        address owner,
        address spender
    ) external view returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

error ADDRESS_ZERO_DETECTED();
error ZERO_VALUE_DETECTED();
error NOT_ENOUGH_TOKENS();
error STAKE_TIME_MUST_BE_IN_THE_FUTURE();
error STAKE_TIME_YET_TO_ELAPSE();
error NO_STAKE_TO_WITHDRAW();
error CANNOT_STAKE_NOW_TRY_AGAIN_LATER();

contract StakingContract {
    uint private TotalStaked;
    address private owner;
    address sCore;

    mapping(address => uint) stakeBalance;
    mapping(address => uint) stakeDuration;
    mapping(address => uint) lastStakedTime;
    mapping(address => uint) noOfStakes;

    event StakingSuccessful(address staker, uint amount, uint staketime);
    event UnstakedSuccessful(address staker, uint stakedAmount);

    constructor(address _sCore) {
        sCore = _sCore;
        owner = msg.sender;
    }

    function stake(uint256 _amount, uint _duration) external {
        if (
            noOfStakes[msg.sender] != 0 &&
            block.timestamp - lastStakedTime[msg.sender] < 10
        ) {
            revert CANNOT_STAKE_NOW_TRY_AGAIN_LATER();
        }
        if (msg.sender == address(0)) {
            revert ADDRESS_ZERO_DETECTED();
        }
        if (_amount <= 0) {
            revert ZERO_VALUE_DETECTED();
        }

        if (IERC20(sCore).balanceOf(msg.sender) < _amount) {
            revert NOT_ENOUGH_TOKENS();
        }

        if (_duration <= 0) {
            revert STAKE_TIME_MUST_BE_IN_THE_FUTURE();
        }

        IERC20(sCore).transferFrom(msg.sender, address(this), _amount);

        stakeBalance[msg.sender] += _amount;
        TotalStaked += _amount;
        stakeDuration[msg.sender] = block.timestamp + _duration;
        lastStakedTime[msg.sender] = block.timestamp;
        noOfStakes[msg.sender]++;

        emit StakingSuccessful(msg.sender, _amount, _duration);
    }

    function unstake() public {
        if (msg.sender == address(0)) {
            revert ADDRESS_ZERO_DETECTED();
        }

        if (stakeBalance[msg.sender] <= 0) {
            revert NO_STAKE_TO_WITHDRAW();
        }

        if (block.timestamp <= stakeDuration[msg.sender]) {
            revert STAKE_TIME_YET_TO_ELAPSE();
        }

        uint256 _stk = stakeBalance[msg.sender];
        uint _timeStaked = block.timestamp - stakeDuration[msg.sender];
        stakeBalance[msg.sender] = 0;
        TotalStaked -= _stk;
        uint256 reward = Calculatereward(_stk, _timeStaked);
        uint256 totalWithdrawAmount = _stk + reward;

        IERC20(sCore).transfer(msg.sender, totalWithdrawAmount);

        emit UnstakedSuccessful(msg.sender, totalWithdrawAmount);
    }

    function emergencyWithdraw() public {
        if (msg.sender == address(0)) {
            revert ADDRESS_ZERO_DETECTED();
        }

        if (stakeBalance[msg.sender] <= 0) {
            revert NO_STAKE_TO_WITHDRAW();
        }

        uint256 _amount = stakeBalance[msg.sender];
        stakeBalance[msg.sender] = 0;
        TotalStaked -= _amount;

        IERC20(sCore).transfer(msg.sender, _amount);

        emit UnstakedSuccessful(msg.sender, _amount);
    }

    function Calculatereward(
        uint256 _amount,
        uint _timeInSec
    ) public pure returns (uint256) {
        return (_amount * 7 * _timeInSec) / 100;
    }

    function checkUserStakedBalance(
        address _user
    ) external view returns (uint256) {
        return stakeBalance[_user];
    }

    function totalStakedBalance() external view returns (uint256) {
        return TotalStaked;
    }

    function _calcDuration() external view returns (uint256, string memory) {
        if (stakeBalance[msg.sender] == 0) {
            return (0, "You have no stake to withdraw");
        }

        if (stakeDuration[msg.sender] > block.timestamp) {
            return (
                stakeDuration[msg.sender] - block.timestamp,
                "Staking not matured"
            );
        } else {
            return (0, "Stake matured");
        }
    }

    function returnStakeDuration(
        address _user
    ) external view returns (uint256) {
        return stakeDuration[_user];
    }

    function returnNoOfStakes() external view returns (uint256) {
        return noOfStakes[msg.sender];
    }
}
